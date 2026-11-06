import { GamePage } from "@/features/game";
import { StatisticsPage } from "@/features/statistics";
import { DataSetsTab } from "@/features/tools";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TAB =
  "rounded-none border-b-2 border-transparent bg-transparent px-0 py-2 text-lg hover:text-primary focus-visible:text-primary focus-visible:outline-none data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-primary data-[state=active]:shadow-none";

export function App() {
  return (
    <Tabs
      defaultValue="game"
      className="min-h-screen gap-0 bg-background text-foreground"
    >
      <header className="border-b border-border px-6 pt-4">
        <h1 className="flex items-center gap-3 text-3xl font-bold">
          <img src="/logo.svg" alt="" className="size-11" />
          <span>
            <span className="text-foreground">Tech</span>{" "}
            <span className="text-heading">Wise</span>{" "}
            <span className="text-foreground">Academy</span>
          </span>
        </h1>
        <TabsList className="mt-3 h-auto justify-start gap-6 rounded-none bg-transparent p-0">
          <TabsTrigger value="game" className={TAB}>
            Game
          </TabsTrigger>
          <TabsTrigger value="statistics" className={TAB}>
            Statistik
          </TabsTrigger>
          <TabsTrigger value="tools" className={TAB}>
            Toolübersicht
          </TabsTrigger>
        </TabsList>
      </header>
      <main className="p-6">
        <TabsContent value="game">
          <GamePage />
        </TabsContent>
        <TabsContent value="statistics">
          <StatisticsPage />
        </TabsContent>
        <TabsContent value="tools">
          <DataSetsTab />
        </TabsContent>
      </main>
    </Tabs>
  );
}
