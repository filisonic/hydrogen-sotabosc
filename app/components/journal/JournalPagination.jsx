import {PaginatedResourceSection} from '~/components/PaginatedResourceSection';

/**
 * @param {{
 *   connection: Parameters<typeof PaginatedResourceSection>[0]['connection'];
 *   children: Parameters<typeof PaginatedResourceSection>[0]['children'];
 *   className?: string;
 * }}
 */
export function JournalPagination({connection, children, className = 'journal-grid-featured'}) {
  return (
    <PaginatedResourceSection
      connection={connection}
      resourcesClassName={className}
      paginationClassName="journal-pagination"
    >
      {children}
    </PaginatedResourceSection>
  );
}
