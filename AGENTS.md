# 仓库开发说明

修改主题前，先阅读 `.agents/skills/valaxy-theme/SKILL.md` 及其引用的主题契约，再阅读 [Lolimeow 本地补充](.agents/project-notes/valaxy-theme.md)。

- `.agents/skills/valaxy-theme/` 与 `skills-lock.json` 由上游 skill 更新流程维护。仓库特有的约束和版本差异写在 `.agents/project-notes/`，不要直接改写上游原文。
- README 面向主题使用者，不放排障日志、内部验证记录或临时工程规避说明。具体配置写入 `docs/`，开发注意事项写入本地补充。
- 验证范围遵循当前任务授权。用户要求自行验证时，提供步骤与预期结果，不擅自运行构建、测试或启动服务。
