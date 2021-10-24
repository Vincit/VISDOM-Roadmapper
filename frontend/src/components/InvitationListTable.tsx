import { FC, useEffect, useState, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { TableInvitationRow } from './TableInvitationRow';
import { table } from './Table';
import { Invitation } from '../redux/roadmaps/types';
import {
  invitationSort,
  InvitationSortingTypes,
} from '../utils/SortInvitationsUtils';

export const InvitationList: FC<{
  search: string;
  invitations: Invitation[];
}> = ({ search, invitations }) => {
  const [selectedInvitations, setSelectedInvitations] = useState<Invitation[]>(
    [],
  );

  useEffect(() => {
    // Filter, search, sort invitations
    const selected = invitations.filter(({ email }) =>
      email.toLowerCase().includes(search),
    );
    setSelectedInvitations(selected ?? []);
  }, [invitations, search]);

  const filterPredicate = search
    ? ({ email }: Invitation) => email.toLowerCase().includes(search)
    : undefined;

  const InvitationsTable = useMemo(
    () =>
      table({
        Title: () => (
          <p className="typography-subtitle">
            <Trans i18nKey="Pending Invitations" />
          </p>
        ),
        getSort: invitationSort(),
        Row: TableInvitationRow,
        header: [
          {
            label: 'Role',
            sorting: InvitationSortingTypes.SORT_ROLE,
            width: '0.5fr',
          },
          {
            label: 'Contact information',
            sorting: InvitationSortingTypes.SORT_EMAIL,
          },
          {
            label: 'Link sent',
            sorting: InvitationSortingTypes.SORT_DATE,
          },
          {
            label: 'Link valid',
            sorting: InvitationSortingTypes.SORT_VALID,
            width: '0.5fr',
          },
          {
            label: '',
          },
        ],
      }),
    [],
  );

  return selectedInvitations.length > 0 ? (
    <InvitationsTable
      items={selectedInvitations}
      filterPredicate={filterPredicate}
    />
  ) : (
    <Trans i18nKey="No invitations found" />
  );
};
