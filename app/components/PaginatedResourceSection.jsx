import * as React from 'react';
import {Pagination} from '@shopify/hydrogen';

/**
 * <PaginatedResourceSection > is a component that encapsulate how the previous and next behaviors throughout your application.
 * @param {Class<Pagination<NodesType>>['connection']>}
 */
export function PaginatedResourceSection({
  connection,
  children,
  resourcesClassName,
  paginationClassName,
}) {
  return (
    <Pagination connection={connection}>
      {({nodes, isLoading, PreviousLink, NextLink}) => {
        const resourcesMarkup = nodes.map((node, index) =>
          children({node, index}),
        );

        const paginationClass = paginationClassName || '';

        return (
          <div>
            <PreviousLink className={paginationClass}>
              {isLoading ? 'Loading…' : <span>← Previous</span>}
            </PreviousLink>
            {resourcesClassName ? (
              <div className={resourcesClassName}>{resourcesMarkup}</div>
            ) : (
              resourcesMarkup
            )}
            <NextLink className={paginationClass}>
              {isLoading ? 'Loading…' : <span>Next →</span>}
            </NextLink>
          </div>
        );
      }}
    </Pagination>
  );
}
