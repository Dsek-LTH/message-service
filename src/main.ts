import "source-map-support/register";

import * as zmq from "zeromq";
import { graphql, buildSchema } from "graphql";


const schema = buildSchema(`
type Query {
  messages: [Message]
}

type Message { 
  author: Int,
  content: String
}
`);

interface Message {
	author: number;
	content: string;
}

const messages: Message[] = [
	{
		author: 0,
		content: "hey guys!"
	},
	{
		author: 1,
		content: "what's up?"
	},
	{
		author: 2,
		content: "heeeey!"
	},
	{
		author: 0,
		content: "this is cool"
	}

];

const root = {
	messages: messages
};


let socket = zmq.socket("rep");
socket.connect("tcp://localhost:1340");
socket.on("message", async q => {
  const query = q.toString("utf-8");
  console.log(query);
  const result = await graphql(schema, query, root);
  console.log(result);
  socket.send(JSON.stringify(result.data));
});

