import "source-map-support/register";

import * as zmq from "zeromq";
import { graphql, buildSchema } from "graphql";


const schema = buildSchema(`
type Query {
  messages: [Message]
}

type Message { 
  authorId: Int,
  content: String
}
`);

interface Message {
	authorId: number;
	content: string;
}

const messages: Message[] = [
	{
		authorId: 0,
		content: "hey guys!"
	},
	{
		authorId: 1,
		content: "what's up?"
	},
	{
		authorId: 2,
		content: "heeeey!"
	},
	{
		authorId: 0,
		content: "this is cool"
	}
];

const root = {
	messages: messages
};


let socket = zmq.socket("rep");
socket.connect("tcp://localhost:1340");
socket.on("message", async q => {
  const operation = JSON.parse(q.toString("utf-8"));
  console.log(operation);
  const result = await graphql({
    contextValue: operation.context,
    schema,
    source: operation.query,
    variableValues: operation.variables,
    rootValue: root,
  }); //schema, query, root);
  console.log(result);
  socket.send(JSON.stringify(result));
});

