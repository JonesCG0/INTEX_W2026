import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { API_BASE } from '@/lib/api-base';
import { apiFetch } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from 'sonner';
import type { AdminPortalOverview, SocialPerformanceRecord, SocialPostRecord } from '@/types/admin';

export default function Outreach() {
  const [performance, setPerformance] = useState<SocialPerformanceRecord[]>([]);
  const [posts, setPosts] = useState<SocialPostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [platformFilter, setPlatformFilter] = useState('all');
  const [campaignFilter, setCampaignFilter] = useState('all');
  const [topicSearch, setTopicSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const [overviewResponse, postsResponse] = await Promise.all([
          apiFetch(`${API_BASE}/api/admin/portal`),
          apiFetch(`${API_BASE}/api/admin/portal/social-posts`),
        ]);

        if (!overviewResponse.ok || !postsResponse.ok) {
          toast.error('Failed to load outreach analytics');
          return;
        }

        const overview: AdminPortalOverview = await overviewResponse.json();
        const socialPosts: SocialPostRecord[] = await postsResponse.json();
        setPerformance(overview.reports.socialPerformance || []);
        setPosts(socialPosts || []);
      } catch (error) {
        console.error("Outreach load error:", error);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const campaignOptions = useMemo(() => Array.from(new Set(posts.map((post) => post.campaignName).filter(Boolean))) as string[], [posts]);

  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      const matchesPlatform = platformFilter === 'all' || post.platform === platformFilter;
      const matchesCampaign = campaignFilter === 'all' || post.campaignName === campaignFilter;
      const haystack = `${post.contentTopic || ''} ${post.sentimentTone || ''} ${post.postType || ''}`.toLowerCase();
      const matchesSearch = haystack.includes(topicSearch.toLowerCase());
      return matchesPlatform && matchesCampaign && matchesSearch;
    });
  }, [posts, platformFilter, campaignFilter, topicSearch]);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, index) => (
          <div key={index} className="h-28 bg-muted/20 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-2xl text-foreground">Outreach Performance</h1>
        <p className="font-body text-sm text-muted-foreground">Staff-facing view of canonical `social_media_posts` reach, referrals, and campaign quality.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {performance.map((platform) => (
          <Card key={platform.platform}>
            <CardHeader className="pb-2">
              <CardTitle className="font-body text-sm uppercase tracking-widest text-muted-foreground">{platform.platform}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-1">
              <p className="font-display text-3xl text-foreground">{platform.posts}</p>
              <p className="text-xs text-muted-foreground">Posts • Reach {platform.reach.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">Donation referrals {platform.donationReferrals.toLocaleString()} • PHP {platform.estimatedDonationValuePhp.toLocaleString()}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Platform</Label>
          <Select value={platformFilter} onValueChange={setPlatformFilter}>
            <SelectTrigger className="mt-1" aria-label="Filter outreach platform">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All platforms</SelectItem>
              {performance.map((platform) => (
                <SelectItem key={platform.platform} value={platform.platform}>{platform.platform}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Campaign</Label>
          <Select value={campaignFilter} onValueChange={setCampaignFilter}>
            <SelectTrigger className="mt-1" aria-label="Filter outreach campaign">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All campaigns</SelectItem>
              {campaignOptions.map((campaign) => (
                <SelectItem key={campaign} value={campaign}>{campaign}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label className="font-body text-xs uppercase tracking-widest text-muted-foreground">Topic Search</Label>
          <Input value={topicSearch} onChange={(e: ChangeEvent<HTMLInputElement>) => setTopicSearch(e.target.value)} className="mt-1" placeholder="topic, tone, or post type" />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="font-body text-base">Social Post Detail</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Platform</TableHead>
                <TableHead>Campaign</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Reach</TableHead>
                <TableHead className="text-right">CTR</TableHead>
                <TableHead className="text-right">Referrals</TableHead>
                <TableHead className="text-right">Est. Value</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPosts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-10 text-muted-foreground">No posts match the current filters.</TableCell>
                </TableRow>
              ) : (
                filteredPosts.map((post) => (
                  <TableRow key={post.postId}>
                    <TableCell>{post.platform}</TableCell>
                    <TableCell>{post.campaignName || 'Unassigned'}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{post.contentTopic || post.postType || 'General'}</span>
                        <span className="text-[10px] uppercase tracking-widest text-muted-foreground">{post.sentimentTone || 'No tone tag'}</span>
                      </div>
                    </TableCell>
                    <TableCell>{post.createdAt ? new Date(post.createdAt).toLocaleDateString() : 'Unknown'}</TableCell>
                    <TableCell className="text-right">{post.reach.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{(post.engagementRate * 100).toFixed(1)}%</TableCell>
                    <TableCell className="text-right">{post.donationReferrals.toLocaleString()}</TableCell>
                    <TableCell className="text-right">PHP {post.estimatedDonationValuePhp.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
