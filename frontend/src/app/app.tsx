import { GamePage } from "@/features/game";
import { DataSetsTab } from "@/features/tools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export function App() {
  return (
    <Tabs
      defaultValue="game"
      className="min-h-screen gap-0 bg-background text-foreground"
    >
      <header className="border-b border-border px-6 pt-4">
        <h1 className="flex items-center gap-3 text-xl font-semibold">
          <img src="/logo.svg" alt="" className="size-8" />
          Tech Wise Academy
        </h1>
        <TabsList className="mt-3 h-auto justify-start gap-6 rounded-none bg-transparent p-0">
          <TabsTrigger
            value="game"
            className="rounded-none border-b-2 border-transparent bg-transparent px-0 py-2 text-lg data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Game
          </TabsTrigger>
          <TabsTrigger
            value="tools"
            className="rounded-none border-b-2 border-transparent bg-transparent px-0 py-2 text-lg data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
          >
            Toolübersicht
          </TabsTrigger>
        </TabsList>
      </header>
      <main className="p-6">
        <TabsContent value="game">
          <GamePage />
        </TabsContent>
        <TabsContent value="tools">
          <DataSetsTab />
        </TabsContent>
      </main>
    </Tabs>
  );
}
