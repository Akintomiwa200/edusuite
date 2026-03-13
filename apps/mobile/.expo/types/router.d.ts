/* eslint-disable */
import * as Router from 'expo-router';

export * from 'expo-router';

declare module 'expo-router' {
  export namespace ExpoRouter {
    export interface __routes<T extends string | object = string> {
      hrefInputParams: { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/leave/apply`; params?: Router.UnknownInputParams; } | { pathname: `/leave`; params?: Router.UnknownInputParams; } | { pathname: `/maintenance`; params?: Router.UnknownInputParams; } | { pathname: `/social`; params?: Router.UnknownInputParams; };
      hrefOutputParams: { pathname: Router.RelativePathString, params?: Router.UnknownOutputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownOutputParams } | { pathname: `/_sitemap`; params?: Router.UnknownOutputParams; } | { pathname: `/leave/apply`; params?: Router.UnknownOutputParams; } | { pathname: `/leave`; params?: Router.UnknownOutputParams; } | { pathname: `/maintenance`; params?: Router.UnknownOutputParams; } | { pathname: `/social`; params?: Router.UnknownOutputParams; };
      href: Router.RelativePathString | Router.ExternalPathString | `/_sitemap${`?${string}` | `#${string}` | ''}` | `/leave/apply${`?${string}` | `#${string}` | ''}` | `/leave${`?${string}` | `#${string}` | ''}` | `/maintenance${`?${string}` | `#${string}` | ''}` | `/social${`?${string}` | `#${string}` | ''}` | { pathname: Router.RelativePathString, params?: Router.UnknownInputParams } | { pathname: Router.ExternalPathString, params?: Router.UnknownInputParams } | { pathname: `/_sitemap`; params?: Router.UnknownInputParams; } | { pathname: `/leave/apply`; params?: Router.UnknownInputParams; } | { pathname: `/leave`; params?: Router.UnknownInputParams; } | { pathname: `/maintenance`; params?: Router.UnknownInputParams; } | { pathname: `/social`; params?: Router.UnknownInputParams; };
    }
  }
}
