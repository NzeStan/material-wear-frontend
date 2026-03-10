import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export default function HomePage() {
  return (
    <div className="space-y-10 animate-fade-in">

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-4xl font-bold">shadcn/ui is ready</h1>
          <Badge>v0.8</Badge>
        </div>
        <p className="text-muted-foreground text-lg">All components installed and wired up. Start building.</p>
      </div>

      <Separator />

      {/* Buttons */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Buttons</h2>
        <div className="flex flex-wrap gap-3">
          <Button>Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
        </div>
      </section>

      {/* Badges */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Badges</h2>
        <div className="flex flex-wrap gap-2">
          <Badge>Default</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructive</Badge>
        </div>
      </section>

      {/* Cards + Form */}
      <section className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Login</CardTitle>
            <CardDescription>Enter your credentials to continue.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-1">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" placeholder="••••••••" />
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full">Sign In</Button>
          </CardFooter>
        </Card>

        {/* Tabs */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold">Tabs</h2>
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="analytics">Analytics</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              <Card>
                <CardHeader><CardTitle>Overview</CardTitle><CardDescription>Your project summary lives here.</CardDescription></CardHeader>
                <CardContent><p className="text-sm text-muted-foreground">Add your overview content here.</p></CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="analytics">
              <Card><CardHeader><CardTitle>Analytics</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">Charts and metrics go here.</p></CardContent></Card>
            </TabsContent>
            <TabsContent value="settings">
              <Card><CardHeader><CardTitle>Settings</CardTitle></CardHeader><CardContent><p className="text-sm text-muted-foreground">User settings go here.</p></CardContent></Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Avatar */}
      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Avatars</h2>
        <div className="flex gap-3 items-center">
          <Avatar><AvatarImage src="https://github.com/shadcn.png" /><AvatarFallback>SC</AvatarFallback></Avatar>
          <Avatar><AvatarFallback>IS</AvatarFallback></Avatar>
          <Avatar className="h-14 w-14"><AvatarFallback className="text-lg">JD</AvatarFallback></Avatar>
        </div>
      </section>

    </div>
  )
}
