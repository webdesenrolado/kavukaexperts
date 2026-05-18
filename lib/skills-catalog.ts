/**
 * Catálogo curado de Hard Skills e Soft Skills para autocomplete no portal do candidato.
 * Não é exaustivo — funciona como sugestão. O candidato pode cadastrar fora do catálogo.
 */

export const HARD_SKILLS: string[] = [
  // Programação / linguagens
  "Python", "JavaScript", "TypeScript", "Java", "C#", "C++", "Go", "Rust", "PHP", "Ruby",
  "Kotlin", "Swift", "Dart", "R", "Scala", "Elixir", "Lua", "Shell Script", "Bash", "PowerShell",
  // Frontend
  "React", "Next.js", "Vue.js", "Nuxt.js", "Angular", "Svelte", "SvelteKit", "HTML", "CSS",
  "Sass", "Tailwind CSS", "Bootstrap", "Material UI", "Styled Components", "Redux", "Zustand",
  // Backend
  "Node.js", "Express", "NestJS", "Django", "Flask", "FastAPI", "Spring Boot", "ASP.NET",
  "Laravel", "Symfony", "Ruby on Rails", "Phoenix", "Go Gin", "Fastify",
  // Mobile
  "React Native", "Flutter", "Android nativo", "iOS nativo", "Ionic", "Expo",
  // Banco de dados
  "PostgreSQL", "MySQL", "MariaDB", "SQL Server", "Oracle", "SQLite", "MongoDB", "Redis",
  "Elasticsearch", "Cassandra", "DynamoDB", "Firebase", "Supabase", "Prisma", "Drizzle ORM",
  "SQL", "Modelagem de dados", "Tuning de queries",
  // DevOps / Cloud
  "AWS", "Google Cloud", "Azure", "DigitalOcean", "Heroku", "Vercel", "Netlify", "Cloudflare",
  "Docker", "Kubernetes", "Terraform", "Ansible", "Jenkins", "GitHub Actions", "GitLab CI",
  "CircleCI", "ArgoCD", "Prometheus", "Grafana", "Datadog", "New Relic", "Sentry",
  // Versionamento e ferramentas dev
  "Git", "GitHub", "GitLab", "Bitbucket", "Linux", "Unix", "VSCode", "Vim", "JetBrains IDEs",
  // Dados / BI
  "Excel", "Excel avançado", "Power BI", "Tableau", "Looker", "Looker Studio", "Metabase",
  "Power Query", "DAX", "Pandas", "NumPy", "Matplotlib", "Seaborn", "Jupyter",
  "Apache Spark", "Apache Airflow", "dbt", "BigQuery", "Snowflake", "Redshift",
  // IA / Machine Learning
  "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "scikit-learn", "OpenAI API",
  "Anthropic Claude API", "LangChain", "Hugging Face", "RAG", "Fine-tuning de LLM",
  "NLP", "Visão computacional", "Engenharia de prompt",
  // Design
  "Figma", "Sketch", "Adobe XD", "Photoshop", "Illustrator", "InDesign", "After Effects",
  "Premiere", "Canva", "Procreate", "CorelDRAW", "Blender", "3D Studio Max", "Cinema 4D",
  "Design Thinking", "UX Research", "UI Design", "Prototipagem", "Wireframing",
  "Design System", "Acessibilidade (WCAG)",
  // Marketing
  "Google Ads", "Meta Ads", "TikTok Ads", "LinkedIn Ads", "Google Analytics 4", "GTM",
  "SEO técnico", "SEO on-page", "SEO off-page", "Copywriting", "E-mail marketing",
  "Inbound Marketing", "Marketing de conteúdo", "Mídia paga", "Mídia orgânica",
  "HubSpot", "RD Station", "Mailchimp", "ActiveCampaign", "ConvertKit", "Klaviyo",
  "Hotjar", "Pixel do Meta", "Tag Manager",
  // Vendas / CRM
  "Salesforce", "Pipedrive", "HubSpot CRM", "Zoho CRM", "Prospecção ativa", "Outbound",
  "Inbound", "Cold call", "Cold mail", "Pitch comercial", "Negociação consultiva",
  "Spin Selling", "Solution Selling", "Account Management", "Customer Success",
  "Gestão de pipeline", "Forecast de vendas",
  // Atendimento ao cliente
  "Zendesk", "Intercom", "Freshdesk", "WhatsApp Business", "Telefonia (PABX)",
  "Atendimento omnichannel", "Suporte N1", "Suporte N2", "Suporte N3",
  // Gestão / metodologias
  "Scrum", "Kanban", "Lean", "XP", "OKR", "PMBOK", "PMI", "PRINCE2", "Gestão ágil",
  "Gestão de projetos", "Gestão de produto", "Product Discovery", "Product Delivery",
  "Roadmap", "Backlog grooming", "Story mapping",
  // Administrativo / Office
  "Pacote Office", "Word", "PowerPoint", "Google Workspace", "Notion", "Trello", "Asana",
  "Monday", "ClickUp", "Slack", "Microsoft Teams", "Zoom",
  // Finanças / Contábil
  "Contabilidade", "Conciliação bancária", "Fluxo de caixa", "DRE", "Balanço patrimonial",
  "Análise de crédito", "Controladoria", "Auditoria", "FP&A", "Modelagem financeira",
  "Valuation", "Tesouraria", "Tributário", "Fiscal", "SPED", "DCTF",
  "ERP SAP", "ERP TOTVS", "ERP Oracle", "QuickBooks", "Conta Azul", "Omie",
  // RH
  "Recrutamento e seleção", "Folha de pagamento", "eSocial", "Departamento Pessoal",
  "Cargos e salários", "Avaliação de desempenho", "T&D", "DP",
  // Jurídico
  "Direito Trabalhista", "Direito Tributário", "Direito Civil", "Compliance",
  "LGPD", "Contratos", "Petição", "Audiência",
  // Saúde
  "Prontuário eletrônico", "TUSS", "Faturamento hospitalar", "Auditoria clínica",
  // Logística / Operações
  "Gestão de estoque", "Supply Chain", "WMS", "TMS", "Inventário", "Sourcing",
  "Negociação com fornecedores", "Roteirização", "Last mile", "Cross-docking",
  // Indústria
  "Lean Manufacturing", "Six Sigma", "PCP", "Manutenção preventiva", "Manutenção preditiva",
  "AutoCAD", "SolidWorks", "Revit", "SketchUp", "CAD/CAM",
];

export const SOFT_SKILLS: string[] = [
  // Comunicação e relacionamento
  "Comunicação clara", "Comunicação escrita", "Comunicação verbal", "Escuta ativa",
  "Empatia", "Cordialidade", "Diplomacia", "Argumentação lógica", "Persuasão",
  "Apresentação em público", "Storytelling", "Networking", "Feedback construtivo",
  "Receber feedback", "Mediação de conflitos", "Negociação",
  // Trabalho em equipe / liderança
  "Trabalho em equipe", "Colaboração", "Liderança", "Mentoria", "Coaching",
  "Gestão de pessoas", "Delegação", "Empoderamento de equipe", "Inspirar pessoas",
  "Construção de cultura", "Senso de equipe", "Espírito colaborativo",
  // Execução / produtividade
  "Proatividade", "Iniciativa", "Autonomia", "Foco em resultados", "Senso de urgência",
  "Gestão de tempo", "Organização", "Priorização", "Multitarefa", "Foco sustentado",
  "Disciplina", "Autodisciplina", "Pontualidade", "Comprometimento", "Responsabilidade",
  "Mentalidade de dono", "Mentalidade ágil",
  // Pensamento / análise
  "Pensamento crítico", "Pensamento estratégico", "Pensamento sistêmico",
  "Capacidade analítica", "Síntese", "Resolução de problemas", "Tomada de decisão",
  "Visão de longo prazo", "Visão de curto prazo", "Atenção a detalhes",
  "Pensamento criativo", "Criatividade", "Inovação",
  // Aprendizado / desenvolvimento
  "Aprendizado contínuo", "Curiosidade", "Vontade de ensinar", "Humildade intelectual",
  "Autoavaliação", "Capacidade de receber críticas",
  // Resiliência / emocional
  "Resiliência", "Adaptabilidade", "Flexibilidade", "Tolerância a frustração",
  "Inteligência emocional", "Equilíbrio emocional", "Paciência", "Persistência",
  "Coragem", "Confiança", "Autoconfiança", "Otimismo", "Bom humor",
  "Gestão de estresse", "Lidar com pressão", "Lidar com ambiguidade",
  // Ético / pessoal
  "Ética profissional", "Honestidade", "Integridade", "Lealdade", "Sigilo",
  "Discrição", "Transparência", "Senso crítico", "Senso de justiça",
  // Específicos de venda / atendimento
  "Foco no cliente", "Atendimento humanizado", "Cordialidade ao telefone",
  "Capacidade de motivar", "Capacidade de mobilizar pessoas",
];
