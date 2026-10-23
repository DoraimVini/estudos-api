-- Os temas de estudo viraram módulos da trilha (002). Em courses ficam só cursos externos:
-- Curso.dev, certificações, graduação e preparação para entrevistas.
-- Sessões que apontavam para estes cursos ficam com course_id NULL (ON DELETE SET NULL).

DELETE FROM courses WHERE nome IN (
  'Git e GitHub avançado',
  'TypeScript',
  'SQL / PostgreSQL',
  'CS50',
  'React / Next.js',
  'Testes automatizados',
  'Docker + deploy',
  'CI/CD (GitHub Actions)'
);
