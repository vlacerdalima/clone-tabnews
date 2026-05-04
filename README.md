# TabNews

Implementação do [TabNews](https://www.tabnews.com.br) construída do zero como projeto prático do [curso.dev](https://curso.dev).

> **Status:** API em desenvolvimento ativo. Frontend em construção, as aulas dessa etapa ainda estão sendo gravadas no curso.

🔗 **Aplicação em produção:** [Clone Tabnews](clone-tabnews-zeta-liart.vercel.app)

## Sobre o projeto

Este repositório contém minha implementação do TabNews, desenvolvida ao longo de 17 módulos do curso.dev, ministrado por [Filipe Deschamps](https://github.com/filipedeschamps).

A proposta pedagógica do curso é incomum: reconstruir o TabNews do zero, implementando manualmente tudo que normalmente seria abstraído por uma ORM ou biblioteca pronta. O resultado é uma compreensão profunda das engrenagens do desenvolvimento web fullstack.

**O que foi implementado manualmente:**

- Sistema de autenticação e autorização
- Controle de sessão e geração de cookies
- Criptografia de senhas
- Conexão direta com PostgreSQL (sem ORM)
- Migrations com `node-pg-migrate`
- Testes automatizados (TDD)
- Pipeline de CI/CD

**Nenhuma linha de código deste projeto foi gerada por IA.**

## Stack

- **Runtime:** Node.js
- **Framework:** Next.js
- **Banco de dados:** PostgreSQL
- **Migrations:** node-pg-migrate
- **Ambiente de desenvolvimento:** Docker + Docker Compose
- **Testes:** Jest
- **CI/CD:** GitHub Actions
- **Deploy:** Vercel

## Endpoints da API

A maior parte dos endpoints é protegida por autenticação via cookie de sessão e features privilegiadas. Como o frontend ainda está em construção, ainda não há fluxo de login pela interface.Dessa forma, as rotas privadas só podem ser exploradas via cliente HTTP (Postman, Insomnia, curl) com sessão válida.

## Roadmap

- [x] Configuração inicial do projeto
- [x] Conexão com PostgreSQL
- [x] Sistema de migrations
- [x] CRUD de usuários
- [x] Sistema de autenticação
- [x] Controle de sessão e cookies
- [x] Testes automatizados
- [x] CI/CD
- [ ] Frontend (em desenvolvimento)
- [ ] Sistema de conteúdos
- [ ] Sistema de votação (TabCoins)

## Créditos

Projeto desenvolvido durante o [curso.dev](https://curso.dev), ministrado por [Filipe Deschamps](https://github.com/filipedeschamps).

Inspirado pelo [TabNews](https://www.tabnews.com.br), criado pelo próprio Filipe e mantido pela comunidade.

## Licença

[MIT](LICENSE)

---

Desenvolvido por [Vitor Lacerda Lima](https://github.com/vlacerdalima).
