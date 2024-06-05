/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable max-len */
/* eslint-disable no-use-before-define */
import { DomainUser } from '#api/controller/types.js';
import { EventRepository } from '#api/database/event.repository.js';
import { TestBatchRecords } from '#api/database/types.js';
import { GeneralModuleResolver } from '#api/module/types.js';
import { requestStoreDispatcher } from '#api/request-store/request-store-dispatcher.js';
import { Repositoriable } from '#api/resolve/repositoriable.js';
import { GeneralServerResolver } from '#api/server/types.js';
import { CommandService } from '#api/service/concrete-service/command.service.js';
import { CommandServiceParams, InputDodValidator, ServiceResult } from '#api/service/types.js';
import { DatabaseObjectSavingError } from '#core/exeptions.js';
import { ConsoleLogger } from '#core/logger/console-logger.js';
import { getEnvLogMode } from '#core/logger/logger-modes.js';
import { success } from '#core/result/success.js';
import { TupleToUnion } from '#core/tuple-types.js';
import { UuidType } from '#core/types.js';
import { dodUtility } from '#core/utils/dod/dod-utility.js';
import { dtoUtility } from '#core/utils/dto/dto-utility.js';
import { uuidUtility } from '#core/utils/uuid/uuid-utility.js';
import { AggregateRootParams, ARDT, DomainMeta, EventDod, GeneralEventDod, RequestDod } from '#domain/domain-data/domain-types.js';
import { DtoFieldValidator } from '#domain/validator/field-validator/dto-field-validator.js';
import { LiteralFieldValidator } from '#domain/validator/field-validator/literal-field-validator.js';
import { StringChoiceValidationRule } from '#domain/validator/rules/validate-rules/string/string-choice.v-rule.js';
import { BunSqliteDatabase } from '../database.js';
import { EventRepositorySqlite } from '../repositories/event.js';
import { BunSqliteRepository } from '../repository.js';
import { BunSqliteStrategy } from '../transaction/bun-sqlite.strategy.js';
import { BunRepoCtor, MigrateRow } from '../types.js';

export namespace SqliteTestFixtures {
  // ++++++++++++++++++ database and repositories section ++++++++++++++++++++

  export interface UserRepository {
    init(resolver: GeneralModuleResolver): void
    addPost(userId: string, postId: UuidType): void
    findUser(userId: UuidType): UserAttrs | undefined
  }

  export const UserRepository = {
    instance(repositoriable: Repositoriable): UserRepository {
      return repositoriable.resolveRepo(UserRepository) as UserRepository;
    },
  };

  export class UserRepositorySqlite extends BunSqliteRepository<'users', UserAttrs> implements UserRepository {
    tableName = 'users' as const;

    migrationWRows: MigrateRow[] = [];

    create(): void {
      this.db.sqliteDb.run(
        `CREATE TABLE ${this.tableName} (
          userId TEXT PRIMARY KEY,
          login TEXT(50) NOT NULL,
          hash TEXT NOT NULL,
          posts TEXT
        );`,
      );
    }

    async addPost(userId: UuidType, postId: UuidType): Promise<void> {
      if (uuidUtility.isValidValue(postId) === false) {
        throw this.logger.error(`not valid post id: ${postId}`);
      }
      this.db.sqliteDb.prepare('UPDATE users SET posts = json_insert(posts, "$[#]", $postId) WHERE userId=$userId; ').run({ $postId: postId, $userId: userId });
    }

    findUser(userId: string): UserAttrs | undefined {
      const sql = `SELECT * from ${this.tableName} WHERE userId="${userId}"`;
      const attrs = this.db.sqliteDb.query(sql).get() as UserRecord | null;
      if (!attrs) return undefined;
      return this.recordToAttrs(attrs);
    }

    protected recordToAttrs(rec: UserRecord): UserAttrs {
      const posts = JSON.parse(rec.posts) as string[];
      return { ...rec, posts };
    }
  }

  const postCategories = ['music', 'cinema', 'art'] as const;

  type PostCategories = TupleToUnion<typeof postCategories>;

  export type PostAttrs = {
    postId: string,
    name: string,
    body: string,
    desc?: string,
    category: PostCategories,
    authorId: string,
    published: boolean,
  }

  export type PostRecord = Omit<PostAttrs, 'published' | 'desc'> & {
    version: number,
    published: 0 | 1,
    desc: string | null
  }

  type PostDomainMeta = DomainMeta<'PostAr', 'postId'>

  type PostArParams = AggregateRootParams<PostAttrs, PostDomainMeta, never, []>

  type PostARDT = ARDT<PostAttrs, PostDomainMeta, []>

  export interface PostRepository {
    init(resolver: GeneralModuleResolver): void
    addPost(attrs: Omit<PostAttrs, 'published'>): void
    findPost(postId: UuidType): PostAttrs | undefined
    findUserPosts(userId: UuidType): PostAttrs[];
  }

  export const PostRepository = {
    instance(repositoriable: Repositoriable): PostRepository {
      return repositoriable.resolveRepo(PostRepository) as PostRepository;
    },
  };

  export class PostRepositorySqlite
    extends BunSqliteRepository<'posts', PostRecord>
    implements PostRepository {
    tableName = 'posts' as const;

    migrationWRows: MigrateRow[] = [
      {
        id: '9c3b4923-20e3-4d29-bf37-8170103d49c0',
        description: 'add post category column',
        sql: 'ALTER TABLE posts ADD COLUMN category NOT NULL CHECK (category=="music" OR category=="cinema" OR category=="art") DEFAULT "music"',
      },
    ];

    create(): void {
      const sql = `CREATE TABLE ${this.tableName} (
        postId TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        body TEXT NOT NULL CHECK(LENGTH(body) > 5),
        desc TEXT,
        authorId TEXT NOT NULL,
        published BOOLEAN DEFAULT 0 NOT NULL,
        version INTEGER DEFAULT 0 NOT NULL,
        FOREIGN KEY (authorId) REFERENCES users(userId)
      );`;
      this.db.sqliteDb.run(sql);
    }

    addPost(attrs: Omit<PostAttrs, 'published'>): void {
      const sql = this.db.sqliteDb.prepare(`
        INSERT INTO posts
        (postId, name, body, desc, authorId, category, published, version)
        VALUES ($postId, $name, $body, $desc, $authorId, $category, $published, $version);
      `);
      sql.run(this.getObjectBindings({ ...attrs, published: false, version: 0 }));
    }

    findPost(postId: string): PostAttrs | undefined {
      const postRecord = this.db.sqliteDb.prepare(`
        SELECT *
        FROM ${this.tableName}
        WHERE postId = $postId
      `).get({ $postId: postId }) as PostRecord;
      if (postRecord) return this.recordToAttrs(postRecord);
      return undefined;
    }

    findUserPosts(userId: string): PostAttrs[] {
      const posts = this.db.sqliteDb.prepare(`
        SELECT *
        FROM ${this.tableName}
        WHERE authorId = $userId
      `).all({ $userId: userId }) as PostRecord[];
      return posts.map((p) => this.recordToAttrs(p));
    }

    protected recordToAttrs(record: PostRecord): PostAttrs {
      const excludeAttrs = record.desc !== null ? 'version' : ['version', 'desc'] as const;
      return {
        ...dtoUtility.excludeAttrs(record, excludeAttrs),
        published: Boolean(record.published),
      };
    }
  }

  export class BlogDatabase extends BunSqliteDatabase {
    constructor(repoCtors?: BunRepoCtor[]) {
      super(repoCtors ?? [
        UserRepositorySqlite,
        PostRepositorySqlite,
        EventRepositorySqlite,
      ]);
    }
  }

  export type UserAttrs = {
    userId: string,
    login: string,
    hash: string,
    posts: UuidType[],
  }

  export type UserRecord = {
    userId: string,
    login: string,
    hash: string,
    posts: string,
  }

  // ++++++++++++++++++ service section ++++++++++++++++++++

  type AddPostRequestDodAttrs = {
    name: string,
    body: string,
    desc?: undefined | string,
    category: PostCategories,
  }

  type AddPostRequestDod = RequestDod<'addPost', AddPostRequestDodAttrs>

  type AddPostOut = { postId: UuidType }

  type PostAddedEvent = EventDod<
    'PostAdded', 'AddingPostService', 'PostModule', AddPostRequestDodAttrs, PostARDT
  >

  export type AddPostServiceParams = CommandServiceParams<
    'AddingPostService',
    PostArParams,
    AddPostRequestDod,
    AddPostOut,
    never,
    PostAddedEvent[]
  >

  // @ts-ignore: непонятная ошибка которая появляется только при выполнении bun tslint
  const addPostValidator: InputDodValidator<AddPostRequestDod> = new DtoFieldValidator(
    'addPost', true, { isArray: false }, 'dto', {
      name: new LiteralFieldValidator('name', true, { isArray: false }, 'string', []),
      body: new LiteralFieldValidator('body', true, { isArray: false }, 'string', []),
      category: new LiteralFieldValidator('category', true, { isArray: false }, 'string', [
        new StringChoiceValidationRule(postCategories),
      ]),
      // @ts-ignore: непонятная ошибка которая появляется только при выполнении bun tslint
      desc: new LiteralFieldValidator('desc', false, { isArray: false }, 'string', []),
    },
  );

  export class AddPostService extends CommandService<AddPostServiceParams, GeneralModuleResolver> {
    protected transactionStrategy = new BunSqliteStrategy();

    moduleName = 'PostModule';

    inputDodName = 'addPost' as const;

    serviceName = 'AddingPostService' as const;

    aRootName = 'PostAr' as const;

    protected supportedCallers = ['DomainUser'] as const;

    protected validator = addPostValidator;

    runDomain(input: AddPostRequestDod): ServiceResult<AddPostServiceParams> {
      const caller = requestStoreDispatcher.getPayload().caller as DomainUser;
      const postId = uuidUtility.getNewUUID();

      const userRepo = UserRepository.instance(this.moduleResolver);
      const postRepo = PostRepository.instance(this.moduleResolver);
      const eventRepo = EventRepository.instance(this.moduleResolver);
      try {
        userRepo.addPost(caller.userId, postId);

        const postAttrs: PostAttrs = {
          postId,
          ...input.attrs,
          authorId: caller.userId,
          published: false,
        };
        postRepo.addPost(postAttrs);

        const postArdt: PostARDT = {
          attrs: { ...postAttrs, published: false },
          meta: {
            name: 'PostAr',
            idName: 'postId',
            domainType: 'aggregate',
            version: 0,
          },
        };
        const event = dodUtility.getEventDod<PostAddedEvent>('PostAdded', input.attrs, postArdt);
        eventRepo.addEvents([event]);
      } catch (e) {
        if (requestStoreDispatcher.getPayload().databaseErrorRestartAttempts === 0) {
          throw e;
        }
        throw new DatabaseObjectSavingError('fail add user post or post record to repository');
      }

      return success({ postId });
    }

    protected throwErr(errStr: string, attrs: unknown): never {
      throw this.moduleResolver.getLogger().error(errStr, attrs);
    }
  }

  // ++++++++++++++++++ resolver mock section ++++++++++++++++++++
  export function getResolverWithTestDb(): GeneralModuleResolver {
    const db = new BlogDatabase();

    const fakeModuleResolver = {
      getDirPath(): string {
        return import.meta.dir;
      },

      getRunMode(): 'test' | 'prod' {
        return 'test';
      },

      getLogger() {
        return new ConsoleLogger(getEnvLogMode() ?? 'all');
      },

      getModuleName(): string {
        return 'SubjectModule';
      },

      getServerResolver(): GeneralServerResolver {
        return {
          getRunMode() {
            return 'test';
          },
        } as GeneralServerResolver;
      },

      resolveRepo(key: unknown): unknown {
        if (key === UserRepository) return db.getRepository<UserRepositorySqlite>('users');
        if (key === PostRepository) return db.getRepository<PostRepositorySqlite>('posts');
        if (key === EventRepository) return db.getRepository<EventRepositorySqlite>('events');
        throw Error(`not found key: ${key}`);
      },

      getDatabase(): BlogDatabase {
        return db;
      },
    } as unknown as GeneralModuleResolver;

    db.init(fakeModuleResolver); // init and resolves db and repositories
    db.createDb(); // create sqlite db and tables

    return fakeModuleResolver;
  }

  // ++++++++++++++++++ fixture data section ++++++++++++++++++++

  export const userAttrs: UserAttrs = {
    userId: 'e4aaf44c-f727-4b00-b9e1-fcba0feb98c0',
    login: 'Nick',
    hash: 'fff',
    posts: [],
  };
  export const userArAttrs = {
    ...userAttrs,
  };

  export const events: GeneralEventDod[] = [
    {
      attrs: userAttrs,
      meta: {
        eventId: '35c226f6-a150-4987-9b15-1ed3f52f90fa',
        requestId: '7300da3b-545c-492c-b31b-213c02620ed5',
        name: 'addUser',
        serviceName: 'AddingUserService',
        moduleName: 'SubjectModule',
        domainType: 'event',
        created: 1712388395101,
      },
      caller: {
        type: 'DomainUser',
        userId: 'e1114dde-1230-4408-b910-ad7532ffd38c',
      },
      aRoot: {
        attrs: userArAttrs,
        meta: {
          idName: 'userId',
          version: 0,
          name: 'UserAr',
          domainType: 'aggregate',
        },
      },
    },
    {
      attrs: userAttrs,
      meta: {
        eventId: 'de63b084-e565-4090-8972-225f36cd6c2b',
        requestId: '7300da3b-545c-492c-b31b-213c02620ed5',
        name: 'userProfileCreated',
        serviceName: 'CreatingUserProfile',
        moduleName: 'SubjectModule',
        domainType: 'event',
        created: 1712388395101,
      },
      caller: {
        type: 'DomainUser',
        userId: 'e1114dde-1230-4408-b910-ad7532ffd38c',
      },
      aRoot: {
        attrs: userArAttrs,
        meta: {
          idName: 'userId',
          version: 0,
          name: 'UserAr',
          domainType: 'aggregate',
        },
      },
    },
  ];

  export const batchRecords: TestBatchRecords<UserRepositorySqlite | PostRepositorySqlite> = {
    users: [
      {
        userId: '08ea51a1-6d14-42bf-81de-a94a809e3286',
        login: 'Bill',
        hash: 'fff',
        posts: [],
      },
      {
        userId: '38d929f5-d20d-47f3-8844-eb1986ee46ae',
        login: 'f1rstFx',
        hash: 'hhh',
        posts: ['3ee45022-4253-4dbe-9da0-80db931184cc'],
      },
      {
        userId: '131b499e-927d-477c-9d97-c2ae6104985e',
        login: 'Nick',
        hash: 'ccc',
        posts: ['09cdf3d6-93ef-44be-8a3d-2e9da3982049', 'fb369b27-ec5e-452f-b454-e48db4bf6ab4'],
      },
    ],
    posts: [
      {
        postId: '09cdf3d6-93ef-44be-8a3d-2e9da3982049',
        name: 'About thinks',
        body: 'very long text about thinks',
        category: 'cinema',
        authorId: '131b499e-927d-477c-9d97-c2ae6104985e',
        published: true,
        version: 0,
      },
      {
        postId: '3ee45022-4253-4dbe-9da0-80db931184cc',
        name: 'Film Interstellar',
        body: 'long recense',
        desc: 'very nice film',
        category: 'cinema',
        authorId: '38d929f5-d20d-47f3-8844-eb1986ee46ae',
        published: false,
        version: 0,
      },
      {
        postId: 'fb369b27-ec5e-452f-b454-e48db4bf6ab4',
        name: 'Avatar not cool film, imho',
        body: 'long recense',
        category: 'cinema',
        authorId: '131b499e-927d-477c-9d97-c2ae6104985e',
        published: false,
        version: 0,
      },
    ],
  };
}
