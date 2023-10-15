const http = require('http');
const Koa = require('koa');
const cors = require('@koa/cors');
const koaBody = require('koa-body').default;

const app = new Koa();

app.use(koaBody());
app.use(cors());

let tickets = [
  {
    id: 1,
    name: 'Тикет №1',
    description: 'Описание тикета №1',
    status: true,
    created: '08.10.2023 10:53'
  },
  {
    id: 2,
    name: 'Тикет №2',
    description: 'Описание тикета №2',
    status: false,
    created: '09.10.2023 10:54'
  },
  {
    id: 3,
    name: 'Тикет №3',
    description: 'Описание тикета №3',
    status: false,
    created: '10.10.2023 10:55'
  },
];

app.use((ctx, next) => {
  if (ctx.request.method !== 'OPTIONS') {
    next();
    return;
  }
  ctx.response.set('Access-Control-Allow-Origin', '*');
  ctx.response.set('Access-Control-Allow-Methods', 'DELETE, PUT, PATCH, GET, POST');
  ctx.response.status = 204;
});

app.use(ctx => {
  let id;
  let targetTicket;
  const { method } = ctx.request.query;
  switch (method) {
    case 'getAllTickets':
      const ticketsWithoutDescription = [];
      for (const ticket of tickets) {
        ticketsWithoutDescription.push({
          id: ticket.id,
          name: ticket.name,
          status: ticket.status,
          created: ticket.created,
        })
      }
      ctx.response.body = ticketsWithoutDescription;
      return;
    case 'getTicketById':
      ctx.response.body = tickets.filter((element) => element.id === +ctx.request.query.id)[0];
      return;
    case 'createTicket':
      if (ctx.request.method === 'POST') {
        id = 0;
        if (tickets.length > 0) {
          tickets.forEach((element) => id = +element.id > id ? +element.id : id);
          id++;
        } else {
          id = 1;
        }
        tickets.push(
          {
            id: id,
            name: ctx.request.body.name,
            description: ctx.request.body.description,
            status: false,
            created: ctx.request.body.created,
          }
        );
        ctx.response.status = 201;
      }
      return;
    case 'setStatusTicketById':
      if (ctx.request.method === 'PATCH') {
        targetTicket = tickets.find((element) => element.id === +ctx.request.query.id)
        ctx.response.set('Access-Control-Allow-Origin', '*');
        if (targetTicket) {
          targetTicket.status ? targetTicket.status = false : targetTicket.status = true;
          ctx.response.status = 200;
          ctx.response.body = targetTicket.status;
        } else {
          ctx.response.status = 204;
        }
      }
      return;
    case 'updateTicketById':
      if (ctx.request.method === 'PATCH') {
        targetTicket = tickets.find((element) => element.id === +ctx.request.query.id);
        targetTicket.name = ctx.request.body.name;
        targetTicket.description = ctx.request.body.description;
        ctx.response.status = 200;
      } else {
        ctx.response.status = 204;
      }
      return;
    case 'deleteTicketById':
      if (ctx.request.method === 'DELETE') {
        const initialLength = tickets.length;
        tickets = tickets.filter((element) => element.id !== +ctx.request.query.id);
        initialLength !== tickets.length ? ctx.response.status = 204 : ctx.response.status = 404;
      }
      return;
    default:
      ctx.response.status = 404;
      return;
  }
});

const server = http.createServer(app.callback());
const port = 7071;

server.listen(port, (err) => {
  if (err) {
    console.log(err);
    return;
  }
  console.log('Server is listening to '+ port);
})
