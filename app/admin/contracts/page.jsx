import AdminShell from '@/components/admin/AdminShell';
import ContractTable from '@/components/admin/ContractTable';

export default function ContractsPage() {
  return (
    <AdminShell title="Contract Tracking">
      <ContractTable />
    </AdminShell>
  );
}
