/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as admin_queries from "../admin/queries.js";
import type * as campaigns_mutations from "../campaigns/mutations.js";
import type * as campaigns_queries from "../campaigns/queries.js";
import type * as comments_mutations from "../comments/mutations.js";
import type * as comments_queries from "../comments/queries.js";
import type * as dashboard_queries from "../dashboard/queries.js";
import type * as http from "../http.js";
import type * as kpi_mutations from "../kpi/mutations.js";
import type * as kpi_queries from "../kpi/queries.js";
import type * as lib_activityLogger from "../lib/activityLogger.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_dates from "../lib/dates.js";
import type * as lib_notifications from "../lib/notifications.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as lib_rateLimit from "../lib/rateLimit.js";
import type * as lib_validators from "../lib/validators.js";
import type * as notifications_mutations from "../notifications/mutations.js";
import type * as notifications_queries from "../notifications/queries.js";
import type * as tasks_mutations from "../tasks/mutations.js";
import type * as tasks_queries from "../tasks/queries.js";
import type * as teams_mutations from "../teams/mutations.js";
import type * as teams_queries from "../teams/queries.js";
import type * as users_mutations from "../users/mutations.js";
import type * as users_queries from "../users/queries.js";

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";

declare const fullApi: ApiFromModules<{
  "admin/queries": typeof admin_queries;
  "campaigns/mutations": typeof campaigns_mutations;
  "campaigns/queries": typeof campaigns_queries;
  "comments/mutations": typeof comments_mutations;
  "comments/queries": typeof comments_queries;
  "dashboard/queries": typeof dashboard_queries;
  http: typeof http;
  "kpi/mutations": typeof kpi_mutations;
  "kpi/queries": typeof kpi_queries;
  "lib/activityLogger": typeof lib_activityLogger;
  "lib/auth": typeof lib_auth;
  "lib/dates": typeof lib_dates;
  "lib/notifications": typeof lib_notifications;
  "lib/permissions": typeof lib_permissions;
  "lib/rateLimit": typeof lib_rateLimit;
  "lib/validators": typeof lib_validators;
  "notifications/mutations": typeof notifications_mutations;
  "notifications/queries": typeof notifications_queries;
  "tasks/mutations": typeof tasks_mutations;
  "tasks/queries": typeof tasks_queries;
  "teams/mutations": typeof teams_mutations;
  "teams/queries": typeof teams_queries;
  "users/mutations": typeof users_mutations;
  "users/queries": typeof users_queries;
}>;

/**
 * A utility for referencing Convex functions in your app's public API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;

/**
 * A utility for referencing Convex functions in your app's internal API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = internal.myModule.myFunction;
 * ```
 */
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;

export declare const components: {};
