'use client';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useMemo, useState } from 'react';
import { useWhatsappCampaignReplies } from '@/hooks/useWhatsappCampaigns';

interface WhatsappCampaignRepliesTabProps {
  campaignId: string;
}

export default function WhatsappCampaignRepliesTab({
  campaignId,
}: WhatsappCampaignRepliesTabProps) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const limit = 25;

  const repliesQuery = useMemo(
    () => ({
      search,
      page,
      limit,
    }),
    [search, page],
  );

  const { data, isLoading } = useWhatsappCampaignReplies(campaignId, repliesQuery);

  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <Stack spacing={2}>
      <Box className="dashboard-panel rounded-2xl p-4 md:p-6">
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle1" className="font-bold">
              Campaign replies
            </Typography>
            <Typography variant="body2" color="text.secondary" className="mt-1">
              Contacts who replied after receiving this broadcast.
            </Typography>
          </Box>
          <TextField
            size="small"
            label="Search replies"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value);
              setPage(1);
            }}
            className="max-w-md"
          />
        </Stack>
      </Box>

      <Box className="surface-panel overflow-hidden rounded-2xl">
        {isLoading ? (
          <Stack className="items-center py-12">
            <CircularProgress size={24} />
          </Stack>
        ) : (data?.items.length ?? 0) === 0 ? (
          <Typography variant="body2" color="text.secondary" className="p-8 text-center">
            No replies yet. Replies from campaign recipients will appear here once detected.
          </Typography>
        ) : (
          <TableContainer>
            <Table aria-label="Campaign replies">
              <TableHead>
                <TableRow>
                  <TableCell className="font-semibold">Contact</TableCell>
                  <TableCell className="font-semibold">Phone</TableCell>
                  <TableCell className="font-semibold">Replied</TableCell>
                  <TableCell className="font-semibold">Message</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.items ?? []).map((reply) => (
                  <TableRow key={reply.recipientId} hover>
                    <TableCell>{reply.displayName}</TableCell>
                    <TableCell>{reply.phoneE164}</TableCell>
                    <TableCell>
                      {new Date(reply.repliedAt).toLocaleString()}
                    </TableCell>
                    <TableCell className="max-w-md">
                      <Typography variant="body2" className="line-clamp-3 whitespace-pre-wrap">
                        {reply.replyBody ?? '—'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>

      <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Page {page} of {totalPages} ({total} replies)
        </Typography>
        <Stack direction="row" spacing={1}>
          <Chip
            label="Previous"
            clickable
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
          />
          <Chip
            label="Next"
            clickable
            disabled={page >= totalPages}
            onClick={() => setPage((value) => Math.min(totalPages, value + 1))}
          />
        </Stack>
      </Stack>
    </Stack>
  );
}
