import { useEffect, useState, type ChangeEvent } from 'react';
import { API_BASE } from '@/lib/api-base';
import { apiFetch } from '@/lib/api-client';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { IconPlus, IconPencil, IconTrash, IconRefresh, IconUserShield } from '@tabler/icons-react';
import { toast } from 'sonner';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import { motion } from 'framer-motion';

const roles = ["Admin", "Donor"];

interface UserSummary {
  id: number;
  email: string;
  displayName: string;
  role: string;
  lockoutEnabled: boolean;
  lockoutEnd: string | null;
  accessFailedCount: number;
}

export default function Users() {
  const [users, setUsers] = useState<UserSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserSummary | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserSummary | null>(null);

  const [createForm, setCreateForm] = useState({
    email: '',
    displayName: '',
    password: '',
    role: 'Donor',
  });

  const [editForm, setEditForm] = useState({
    displayName: '',
    role: 'Donor',
  });

  async function load() {
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/users`);
      if (response.ok) {
        const data = await response.json();
        setUsers(data || []);
      } else {
        toast.error("Failed to load users");
      }
    } catch (error) {
      console.error("Users load error:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  function openCreate() {
    setEditingUser(null);
    setCreateForm({ email: '', displayName: '', password: '', role: 'Donor' });
    setDrawerOpen(true);
  }

  function openEdit(user: UserSummary) {
    setEditingUser(user);
    setEditForm({
      displayName: user.displayName,
      role: user.role === '—' ? 'Donor' : user.role,
    });
    setDrawerOpen(true);
  }

  async function handleSubmit() {
    try {
      const response = editingUser
        ? await apiFetch(`${API_BASE}/api/admin/users/${editingUser.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              DisplayName: editForm.displayName,
              Role: editForm.role,
            }),
          })
        : await apiFetch(`${API_BASE}/api/admin/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              Email: createForm.email,
              DisplayName: createForm.displayName,
              Password: createForm.password,
              Role: createForm.role,
            }),
          });

      if (response.ok) {
        toast.success(editingUser ? "User updated" : "User created");
        setDrawerOpen(false);
        setEditingUser(null);
        await load();
      } else {
        const error = await response.json().catch(() => null);
        toast.error(error?.error || "Failed to save user");
      }
    } catch (error) {
      toast.error("Failed to save user");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/users/${deleteTarget.id}`, {
        method: 'DELETE',
        confirmDelete: true,
      });
      if (response.ok) {
        toast.success("User deleted");
        setDeleteTarget(null);
        await load();
      } else {
        const error = await response.json().catch(() => null);
        toast.error(error?.error || "Failed to delete user");
      }
    } catch (error) {
      toast.error("Failed to delete user");
    }
  }

  async function handleUnlock(user: UserSummary) {
    try {
      const response = await apiFetch(`${API_BASE}/api/admin/users/${user.id}/unlock`, {
        method: 'POST',
      });
      if (response.ok) {
        toast.success("User unlocked");
        await load();
      } else {
        toast.error("Failed to unlock user");
      }
    } catch (error) {
      toast.error("Failed to unlock user");
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted/30 rounded w-48 animate-pulse" />
        <div className="h-96 bg-muted/20 rounded-lg animate-pulse" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-body text-2xl text-foreground">User Management</h1>
          <p className="font-body text-sm text-muted-foreground">Create, update, unlock, and remove admin or donor accounts</p>
        </div>
        <Button onClick={openCreate} className="font-body gap-2">
          <IconPlus className="h-4 w-4" />
          New User
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
      >
        <div className="max-h-[70vh] overflow-auto">
        <Table>
          <TableHeader className="sticky top-0 z-10 bg-card">
            <TableRow className="bg-muted/30">
              <TableHead className="font-body text-xs uppercase tracking-wider">Email</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider">Display Name</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider">Role</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider">Lockout</TableHead>
              <TableHead className="font-body text-xs uppercase tracking-wider text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-muted-foreground font-body">
                  No users found
                </TableCell>
              </TableRow>
            ) : (
              users.map(user => (
                <TableRow key={user.id} className="transition-colors odd:bg-card even:bg-muted/10 hover:bg-primary/5">
                  <TableCell className="font-body">{user.email}</TableCell>
                  <TableCell className="font-body">{user.displayName}</TableCell>
                  <TableCell>
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] uppercase font-bold bg-primary/10 text-primary">
                      <IconUserShield className="h-3 w-3" />
                      {user.role}
                    </span>
                  </TableCell>
                  <TableCell className="font-body text-sm text-muted-foreground">
                    {user.lockoutEnabled ? `Failures: ${user.accessFailedCount}` : 'Unlocked'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(user)} aria-label={`Edit ${user.email}`} title={`Edit ${user.email}`} type="button">
                        <IconPencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleUnlock(user)} aria-label={`Unlock ${user.email}`} title={`Unlock ${user.email}`} type="button">
                        <IconRefresh className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setDeleteTarget(user)} aria-label={`Delete ${user.email}`} title={`Delete ${user.email}`} type="button">
                        <IconTrash className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </motion.div>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="font-body text-xl tracking-tight">
              {editingUser ? 'Edit User' : 'Create User'}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-4 mt-6">
            {!editingUser ? (
              <>
                <div>
                  <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Email</Label>
                  <Input
                    value={createForm.email}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCreateForm(prev => ({ ...prev, email: e.target.value }))}
                    className="font-body mt-1"
                    type="email"
                  />
                </div>
                <div>
                  <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Display Name</Label>
                  <Input
                    value={createForm.displayName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCreateForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className="font-body mt-1"
                  />
                </div>
                <div>
                  <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Temporary Password</Label>
                  <Input
                    value={createForm.password}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setCreateForm(prev => ({ ...prev, password: e.target.value }))}
                    className="font-body mt-1"
                    type="password"
                  />
                </div>
                <div>
                  <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Role</Label>
                  <Select value={createForm.role} onValueChange={value => setCreateForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="font-body mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <div>
                  <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Display Name</Label>
                  <Input
                    value={editForm.displayName}
                    onChange={(e: ChangeEvent<HTMLInputElement>) => setEditForm(prev => ({ ...prev, displayName: e.target.value }))}
                    className="font-body mt-1"
                  />
                </div>
                <div>
                  <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Role</Label>
                  <Select value={editForm.role} onValueChange={value => setEditForm(prev => ({ ...prev, role: value }))}>
                    <SelectTrigger className="font-body mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map(role => <SelectItem key={role} value={role}>{role}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            <Button onClick={handleSubmit} className="font-body w-full mt-4">
              {editingUser ? 'Save User' : 'Create User'}
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      <DeleteConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete User"
        description={`Are you sure you want to delete ${deleteTarget?.email}? This cannot be undone.`}
      />
    </div>
  );
}
