/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type * as assets_mutations from "../assets/mutations.js";
import type * as assets_queries from "../assets/queries.js";
import type * as campaigns_mutations from "../campaigns/mutations.js";
import type * as campaigns_queries from "../campaigns/queries.js";
import type * as comments_mutations from "../comments/mutations.js";
import type * as comments_queries from "../comments/queries.js";
import type * as dashboard_queries from "../dashboard/queries.js";
import type * as kpi_mutations from "../kpi/mutations.js";
import type * as kpi_queries from "../kpi/queries.js";
import type * as lib_auth from "../lib/auth.js";
import type * as lib_dates from "../lib/dates.js";
import type * as lib_permissions from "../lib/permissions.js";
import type * as lib_validators from "../lib/validators.js";
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
  "assets/mutations": typeof assets_mutations;
  "assets/queries": typeof assets_queries;
  "campaigns/mutations": typeof campaigns_mutations;
  "campaigns/queries": typeof campaigns_queries;
  "comments/mutations": typeof comments_mutations;
  "comments/queries": typeof comments_queries;
  "dashboard/queries": typeof dashboard_queries;
  "kpi/mutations": typeof kpi_mutations;
  "kpi/queries": typeof kpi_queries;
  "lib/auth": typeof lib_auth;
  "lib/dates": typeof lib_dates;
  "lib/permissions": typeof lib_permissions;
  "lib/validators": typeof lib_validators;
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
