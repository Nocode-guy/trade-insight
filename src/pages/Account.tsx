import { useState } from 'react';
import { User, LogOut, Mail, Shield, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function AccountPage() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully');
      setEmail('');
      setPassword('');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Login failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Logout failed');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto mt-12">
        <div className="bg-card rounded-xl border border-border/50 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <User className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">Sign In</h1>
            <p className="text-muted-foreground mt-2">
              Sign in to save your trades and access them anywhere
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{' '}
            <a
              href="http://localhost:8000/register.html"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
            >
              Register here
            </a>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-foreground">Account</h1>

      <div className="bg-card rounded-xl border border-border/50 p-6">
        <div className="flex items-start gap-4">
          <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <User className="w-8 h-8 text-primary" />
          </div>

          <div className="flex-1">
            <h2 className="text-xl font-semibold text-foreground">{user?.email}</h2>
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Mail className="w-4 h-4" />
                <span>Verified</span>
              </div>
              {user?.is_approved && (
                <div className="flex items-center gap-1 text-green-500">
                  <Shield className="w-4 h-4" />
                  <span>Approved</span>
                </div>
              )}
            </div>
          </div>

          <Button variant="outline" onClick={handleLogout} className="gap-2">
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-card rounded-xl border border-border/50 p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Trade Journal
          </h3>
          <p className="text-sm text-muted-foreground">
            Your trades are automatically synced to the cloud. Import trades from Robinhood or add them manually.
          </p>
        </div>

        <div className="bg-card rounded-xl border border-border/50 p-6">
          <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Data Security
          </h3>
          <p className="text-sm text-muted-foreground">
            Your data is stored securely and only accessible by you. We never share your trading data.
          </p>
        </div>
      </div>
    </div>
  );
}
