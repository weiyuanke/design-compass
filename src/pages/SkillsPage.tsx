import { useState } from "react";
import { motion } from "framer-motion";
import { Search, Download, ArrowDownToLine } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { platformSkills } from "@/data/skills";

const SkillsPage = () => {
  const [search, setSearch] = useState("");

  const categories = Array.from(new Set(platformSkills.map((s) => s.category)));
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filtered = platformSkills.filter((s) => {
    const matchSearch = s.name.includes(search) || s.description.includes(search) || s.category.includes(search);
    const matchCat = !activeCategory || s.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <div className="p-6 lg:p-8 max-w-full space-y-6">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">Skill 市场</h1>
        <p className="text-sm text-muted-foreground mt-1">
          平台内置的 Skill 组件，下载后可在创建 Agent 时使用
        </p>
      </motion.div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="搜索 Skill..."
            className="pl-10 bg-secondary/50 border-border/50 h-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              !activeCategory ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
            }`}
          >
            全部
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat === activeCategory ? null : cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                activeCategory === cat ? "bg-primary/15 text-primary" : "bg-secondary text-muted-foreground hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((skill, i) => (
          <motion.div
            key={skill.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="flex flex-col gap-3 p-5 rounded-xl bg-card border border-border/50 hover:border-border transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center text-lg flex-shrink-0">
                {skill.emoji}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-foreground text-sm">{skill.name}</span>
                  <Badge variant="secondary" className="text-[10px]">{skill.category}</Badge>
                </div>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{skill.description}</p>
              </div>
            </div>
            <div className="flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {skill.downloads.toLocaleString()}
                </span>
                <span>v{skill.version}</span>
              </div>
              <Button size="sm" variant="outline" className="gap-1.5 h-7 text-xs">
                <ArrowDownToLine className="h-3 w-3" />
                下载
              </Button>
            </div>
          </motion.div>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          没有找到匹配的 Skill
        </div>
      )}
    </div>
  );
};

export default SkillsPage;
