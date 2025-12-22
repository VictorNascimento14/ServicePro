# Como subir o projeto na Vercel

1. Faça login em https://vercel.com e crie um novo projeto, conectando ao seu repositório.
2. Certifique-se de que o arquivo `vercel.json` está presente na raiz do projeto.
3. Configure as variáveis de ambiente no painel da Vercel conforme o arquivo `.env.example`.
4. O projeto Next.js será detectado automaticamente. O projeto Vite será tratado como static-build.
5. Clique em "Deploy" e aguarde a publicação.

## Observações
- Se usar Convex, configure as variáveis de ambiente do Convex na Vercel.
- Para autenticação Clerk, adicione as chaves Clerk no painel de variáveis da Vercel.
- Se precisar de rotas customizadas, ajuste o `vercel.json` conforme necessário.

## Referências
- [Documentação Vercel](https://vercel.com/docs)
- [Deploy Next.js](https://vercel.com/docs/concepts/projects/overview)
- [Deploy Vite](https://vercel.com/docs/concepts/deployments/static-sites)
