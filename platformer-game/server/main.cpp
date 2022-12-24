// CrowCPP Websocket server for Platformer.
// This allows a "server" running on a client machine to send blocks to a bunch of other client machines

#include <crow.h>
#include <vector>
#include <string>
#include <map>
#include <mutex>

unsigned long long rollingID = 0;

struct Client{
	crow::websocket::connection* conn;
	unsigned long long id;
};

struct Server{
	std::string name;
	crow::websocket::connection* server;
	std::vector<Client*> clients;
	Client* getClient(crow::websocket::connection* conn){
		for (Client* c : clients){
			if (c -> conn == conn){
				return c;
			}
		}
		return 0;
	}
};


std::map<crow::websocket::connection*, Server*> servers; // Map servers to "server"-type clients
std::map<crow::websocket::connection*, Server*> clients; // Map servers to "client"-type clients
std::mutex clientsMutex;


Server* findServerByName(std::string name){
	for (const auto& iterator : servers){
		if (iterator.second -> name == name){
			return iterator.second;
		}
	}
	return 0;
}


int main(){
	crow::SimpleApp server; // I'm very proud I got all this from memory.
	// Oh wait it's just because Crow is hella convenient
	CROW_ROUTE(server, "/platformer-multiplayer-room-ws").websocket().onopen([&](crow::websocket::connection& conn){
		// Clients can connect benevolently without even being recorded. They *are* recorded when they send a request.
	}).onmessage([&](crow::websocket::connection& conn, std::string message, bool is_binary){
		if (servers.contains(&conn)){ // "server"-type client
			std::string buf;
			int pos = 0;
			while (message[pos] >= '0' && message[pos] <= '9'){
				buf += message[pos];
				pos ++;
			}
			message = message.substr(pos);
			if (buf.size() > 0){
				unsigned long long sendID = std::stoi(buf);
				for (Client* c : servers[&conn] -> clients){
					if (c -> id == sendID){
						c -> conn -> send_text(message);
					}
				}
			}
			else{
				for (Client* c : servers[&conn] -> clients){
					c -> conn -> send_text(message);
				}
			}
		}
		else if (clients.contains(&conn)){ // "client"-type client
			clients[&conn] -> server -> send_text(std::to_string(clients[&conn] -> getClient(&conn) -> id) + message);
		}
		else{ // Unbound client: either new or "disconnected"
			if (message[0] == 's'){ // new "server"-type
				servers[&conn] = new Server{message.substr(1), &conn};
				conn.send_text("s"); // Eventually add a fail condition
			}
			else if (message[0] == 'c'){ // new "client"-type
				clientsMutex.lock();
				std::string sName = message.substr(1);
				Server* s = findServerByName(sName);
				if (s){
					s -> clients.push_back(new Client{&conn, rollingID});
					s -> server -> send_text("c" + std::to_string(rollingID));
					clients[&conn] = s;
					rollingID ++;
					conn.send_text("c");
				}
				else{
					conn.send_text("f");
				}
				clientsMutex.unlock();
			}
		}
	}).onclose([&](crow::websocket::connection& conn, std::string reason){
		if (clients.contains(&conn)){
			clientsMutex.lock();
			for (unsigned long int x = 0; x < clients[&conn] -> clients.size(); x ++){
				std::cout << "Yo: " << clients[&conn] << std::endl;
				std::cout << "Tuba: " << clients[&conn] -> clients[x] << std::endl;
				if (clients[&conn] -> clients[x] -> conn == &conn){
					clients[&conn] -> clients.erase(clients[&conn] -> clients.begin() + x);
					break;
				}
			}
			clients.erase(&conn);
			clientsMutex.unlock();
		}
		else if (servers.contains(&conn)){
			for (auto i = clients.cbegin(); i != clients.cend();){
				if (i -> second == servers[&conn]){
					clients.erase(i ++);
				}
				else{
					i ++;
				}
			}
			delete servers[&conn];
			servers.erase(&conn);
		}
	});
	server.port(8080).multithreaded().run();
	return 867-5309;
}
