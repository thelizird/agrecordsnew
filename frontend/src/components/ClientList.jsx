function ClientList({ clients, searchQuery, setSearchQuery, onClientClick }) {
    return (
      <div className="flex-1 w-full p-5">
        <h2 className="text-2xl text-black mb-4 text-center">Your Clients</h2>
  
        {/* Center the search input */}
        <div className="flex justify-center">
          <input
            type="text"
            placeholder="Search clients..."
            className="p-2 border-2 border-black rounded-lg mb-4 max-w-[600px] w-full"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
  
        {clients.length === 0 ? (
          <p className="text-black text-center">No clients found. Add a new client to get started.</p>
        ) : (
          <ul className="space-y-4">
            {clients
              .filter(client =>
                client.name.toLowerCase().includes(searchQuery.toLowerCase())
              )
              .map(client => (
                <li 
                  key={client.id} 
                  className="bg-white p-4 rounded-lg border-2 border-black mx-auto max-w-[600px] w-full cursor-pointer"
                  onClick={() => onClientClick(client)}
                >
                  <h3 className="text-xl font-semibold">
                    {client.name}
                  </h3>
                </li>
              ))}
          </ul>
        )}
      </div>
    );
  }
  
  export default ClientList;