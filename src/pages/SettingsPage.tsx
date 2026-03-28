import { useState } from "react";
import { motion } from "framer-motion";
import { User, Mail, Phone, Building, MapPin, Save } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { toast } from "sonner";

const SettingsPage = () => {
  const [form, setForm] = useState({
    name: "张三",
    email: "zhangsan@example.com",
    phone: "138-0000-0000",
    company: "",
    location: "",
    bio: "",
  });

  const update = (key: string, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    toast.success("设置已保存");
  };

  const fields = [
    { key: "name", label: "姓名", icon: User, placeholder: "输入你的姓名" },
    { key: "email", label: "邮箱", icon: Mail, placeholder: "输入邮箱地址", type: "email" },
    { key: "phone", label: "手机号", icon: Phone, placeholder: "输入手机号", type: "tel" },
    { key: "company", label: "公司 / 组织", icon: Building, placeholder: "输入公司名称" },
    { key: "location", label: "所在地", icon: MapPin, placeholder: "输入所在城市" },
  ];

  return (
    <div className="p-6 lg:p-8 max-w-2xl mx-auto space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-foreground">用户设置</h1>
        <p className="text-sm text-muted-foreground mt-1">管理你的个人信息</p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex items-center gap-4"
      >
        <Avatar className="h-16 w-16">
          <AvatarFallback className="bg-accent/20 text-accent text-xl font-medium">
            {form.name.charAt(0)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium text-foreground">{form.name}</p>
          <p className="text-sm text-muted-foreground">{form.email}</p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-5 rounded-xl border border-border/50 bg-card p-6"
      >
        {fields.map(({ key, label, icon: Icon, placeholder, type }) => (
          <div key={key} className="space-y-1.5">
            <Label className="flex items-center gap-1.5 text-muted-foreground">
              <Icon className="h-3.5 w-3.5" />
              {label}
            </Label>
            <Input
              type={type || "text"}
              value={form[key as keyof typeof form]}
              onChange={(e) => update(key, e.target.value)}
              placeholder={placeholder}
              className="bg-secondary/50 border-border/50"
            />
          </div>
        ))}

        <div className="space-y-1.5">
          <Label className="text-muted-foreground">个人简介</Label>
          <Textarea
            value={form.bio}
            onChange={(e) => update("bio", e.target.value)}
            placeholder="简单介绍一下自己..."
            className="bg-secondary/50 border-border/50 min-h-[80px] resize-none"
          />
        </div>
      </motion.div>

      <div className="flex justify-end">
        <Button onClick={handleSave} className="gap-2">
          <Save className="h-4 w-4" />
          保存设置
        </Button>
      </div>
    </div>
  );
};

export default SettingsPage;
