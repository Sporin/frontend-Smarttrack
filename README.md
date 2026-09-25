# SmartTrack - Frontend

Frontend do SmartTrack, um sistema web de logística de transporte que desenvolvi como projeto acadêmico na PUC-SP. O sistema foi pensado a partir de um levantamento de requisitos feito com a BJ Transportes, uma empresa de logística que precisava controlar melhor as entregas, os motoristas e os operadores responsáveis por elas.

Este repositório tem só o frontend. O backend foi desenvolvido pelo Luiz Fernando em um repositório separado, em Java com Spring Boot, e o frontend se comunica com ele por uma API REST.

## Funcionalidades

O sistema tem dois tipos de usuário.

O operador de logística pode:

- publicar novas entregas, escolhendo o motorista responsável e a data de envio
- consultar e monitorar o status de todas as entregas (a lista atualiza sozinha a cada 30 segundos)
- filtrar as entregas por status
- ver um relatório com o total de entregas por status e a lista detalhada
- ver as notificações geradas pelas entregas

O motorista pode:

- ver as entregas atribuídas a ele
- atualizar o status de cada entrega (pendente, em trânsito ou entregue)

Também tem uma tela de cadastro, onde a pessoa escolhe se vai entrar como motorista ou operador.

Os status possíveis de uma entrega são PENDENTE, EM_TRANSITO, ENTREGUE e CANCELADO.

## Tecnologias

- React 19 (Create React App)
- React Router 7
- Tailwind CSS 3
- Axios

## Como funciona a comunicação com o backend

O backend do Luiz é dividido em quatro microserviços, e cada um roda em uma porta. Cada arquivo em `src/services` conversa com um deles:

| Arquivo                  | Serviço              | Endereço                                       |
|--------------------------|----------------------|------------------------------------------------|
| authService.js           | driver-service       | http://localhost:8082/driver-service           |
| driverService.js         | driver-service       | http://localhost:8082/driver-service           |
| deliveryService.js       | delivery-service     | http://localhost:8081/delivery-service         |
| operatorService.js       | operator-service     | http://localhost:8083                          |
| notificationService.js   | notification-service | http://localhost:8084/notification-service     |

Os endereços estão escritos direto nesses arquivos. Se o backend mudar de porta ou de caminho, é neles que precisa alterar.

O arquivo `src/services/api.js` cria uma instância do Axios para cada serviço. Antes de cada requisição ele pega o token JWT salvo no localStorage e coloca no cabeçalho `Authorization`. Se o backend responder 401, ele apaga o token e manda o usuário de volta para o login.

O login sempre passa pelo driver-service, mesmo para operadores. A resposta vem no formato `{ token, role, nome, id }`, e o `authService` transforma isso em `{ token, user: { id, nome, role, email } }`, que é o formato usado no resto do frontend. O controle de quem está logado fica no `AuthContext`, e o `PrivateRoute` impede que um motorista abra a tela do operador e vice-versa.

## Como rodar

### Pré-requisitos

- Node.js e npm
- O backend rodando localmente, se for usar dados reais (as instruções de como rodar o backend ficam no repositório dele)

### Passos

Clone o repositório e instale as dependências:

```
git clone https://github.com/Sporin/frontend-Smarttrack.git
cd frontend-Smarttrack
npm install
```

O `.env` não vai para o GitHub, então é preciso criar ele na raiz do projeto:

```env
REACT_APP_USE_MOCK=false
```

Depois é só iniciar:

```
npm start
```

O projeto abre em `http://localhost:3000`.

### Modo mock

Se quiser testar só o frontend, sem o backend ligado, coloque `REACT_APP_USE_MOCK=true` no `.env` e reinicie o `npm start`. Nesse modo os services devolvem dados fictícios e a tela de login mostra usuários de teste (todos com a senha 123456):

- motorista@puc.com
- operador@puc.com

## Estrutura de pastas

```
src/
  App.js                       rotas da aplicação
  contexts/AuthContext.jsx     login, logout e usuário logado
  components/PrivateRoute.jsx  proteção das rotas por tipo de usuário
  pages/
    Login.jsx
    Register.jsx               cadastro de motorista e operador
    dashboards/
      MotoristaDashboard.jsx
      OperadorDashboard.jsx
  services/
    api.js                     configuração do Axios e envio do token
    authService.js
    deliveryService.js
    driverService.js
    operatorService.js
    notificationService.js
```

## Problemas que tive ao integrar com o backend

Deixei anotado aqui porque pode acontecer de novo com quem for rodar o projeto.

- Erro de CORS no login: o `CorsConfig` do backend não bastava com o Spring Security ativo. O Luiz e eu resolvemos configurando o CORS direto no `SecurityConfig` do driver-service e do operator-service.
- Erro 404 nas chamadas: alguns serviços usam context path e outros não. O driver-service e o delivery-service precisam do nome do serviço na URL, e o operator-service não.
- Os roles precisam bater exatamente com o que o backend manda (MOTORISTA e OPERADOR). No começo o frontend esperava nomes diferentes e só o login de motorista funcionava.
- A criação de entrega precisa mandar `motoristaId`, `operadorId` e `dataEnvio`. O backend não tem campos de origem e destino, então tirei eles das telas.

## Observações

- A listagem de notificações ainda retorna 404 no notification-service, então essa seção do painel do operador aparece vazia por enquanto. Marcar uma notificação como lida só funciona no frontend, porque o backend ainda não tem esse endpoint.
- Ainda existem no código algumas telas da primeira versão (GestorDashboard, Acompanhamento e NovaEntrega) que não são mais usadas, já que o sistema final ficou só com motorista e operador.
