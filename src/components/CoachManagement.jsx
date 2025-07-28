// Replace your CoachManagement component with this debug version:

const CoachManagement = () => {
  const [coaches, setCoaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalState, setModalState] = useState({ type: null, coach: null });
  const { token } = useAuth();

  // Add debug logging
  console.log("=== COACH MANAGEMENT RENDER ===");
  console.log("Token exists:", !!token);
  console.log("Current modalState:", modalState);
  console.log("Coaches count:", coaches.length);

  const fetchCoaches = async () => {
    if (!token) return;
    try {
      setLoading(true);
      console.log("Fetching coaches...");
      const res = await axios.get('/.netlify/functions/manage-coaches', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log("Coaches fetched:", res.data);
      setCoaches(res.data);
    } catch (err) {
      console.error('Failed to fetch coaches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    console.log("useEffect triggered - fetching coaches");
    fetchCoaches();
  }, [token]);

  // Add debug to modal state changes
  useEffect(() => {
    console.log("=== MODAL STATE CHANGED ===");
    console.log("modalState:", modalState);
    console.log("Should render modal?", !!modalState.type);
  }, [modalState]);

  const handleSaveCoach = async (coachData) => {
    console.log("=== SAVING COACH ===", coachData);
    try {
      if (coachData.id) {
        // Update existing coach
        await axios.put('/.netlify/functions/manage-coaches', coachData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        // Create new coach
        await axios.post('/.netlify/functions/manage-coaches', coachData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      setModalState({ type: null, coach: null });
      fetchCoaches();
    } catch (err) {
      alert('Failed to save coach.');
      console.error(err);
    }
  };

  const handleDeleteCoach = async (coach) => {
    if (window.confirm(`Are you sure you want to delete ${coach.name}?`)) {
      try {
        await axios.delete('/.netlify/functions/manage-coaches', {
          headers: { Authorization: `Bearer ${token}` },
          data: { id: coach.id }
        });
        fetchCoaches();
      } catch (err) {
        alert('Failed to delete coach.');
        console.error(err);
      }
    }
  };

  const getSkillColor = (avatarColor) => {
    if (avatarColor.includes('sky') || avatarColor.includes('blue')) return 'bg-sky-500/20 text-sky-300';
    if (avatarColor.includes('green') || avatarColor.includes('emerald')) return 'bg-green-500/20 text-green-300';
    if (avatarColor.includes('purple') || avatarColor.includes('violet')) return 'bg-purple-500/20 text-purple-300';
    if (avatarColor.includes('red') || avatarColor.includes('rose')) return 'bg-red-500/20 text-red-300';
    if (avatarColor.includes('orange') || avatarColor.includes('amber')) return 'bg-orange-500/20 text-orange-300';
    if (avatarColor.includes('pink') || avatarColor.includes('fuchsia')) return 'bg-pink-500/20 text-pink-300';
    return 'bg-gray-500/20 text-gray-300';
  };

  // Debug the modal rendering
  const renderModal = () => {
    console.log("=== RENDER MODAL FUNCTION ===");
    console.log("modalState.type:", modalState.type);
    
    if (modalState.type) {
      console.log("=== RETURNING COACH MODAL ===");
      return (
        <CoachModal
          coach={modalState.coach}
          onSave={handleSaveCoach}
          onCancel={() => {
            console.log("=== MODAL CANCEL CLICKED ===");
            setModalState({ type: null, coach: null });
          }}
        />
      );
    }
    
    console.log("=== NOT RENDERING MODAL ===");
    return null;
  };

  return (
    <>
      {/* Debug modal rendering */}
      {renderModal()}

      <div className="rounded-xl border border-white/20 bg-black/30 backdrop-blur-lg shadow-2xl">
        <div className="p-6 border-b border-white/20 flex justify-between items-center">
          <h2 className="text-3xl font-bold tracking-tight text-white">Coach Management</h2>
          <button
            onClick={() => {
              console.log("=== ADD COACH BUTTON CLICKED ===");
              console.log("Current modalState before click:", modalState);
              
              // Try immediate alert to test if click works
              alert("Button was clicked!");
              
              setModalState({ type: 'add', coach: null });
              console.log("setModalState called with:", { type: 'add', coach: null });
              
              // Check state after a brief delay
              setTimeout(() => {
                console.log("modalState after timeout:", modalState);
              }, 100);
            }}
            className="h-10 px-4 bg-sky-500 text-white hover:bg-sky-600 rounded-md text-sm font-bold"
            style={{ zIndex: 1 }} // Ensure button is clickable
          >
            + Add Coach
          </button>
        </div>

        <div className="p-6">
          {/* Add a debug section */}
          <div className="mb-4 p-2 bg-gray-800 rounded text-xs text-white">
            <strong>Debug Info:</strong><br/>
            Token: {token ? "Present" : "Missing"}<br/>
            Modal Type: {modalState.type || "null"}<br/>
            Coaches: {coaches.length}<br/>
            Loading: {loading.toString()}
          </div>

          {loading ? (
            <div className="text-center text-white/60 py-8">Loading coaches...</div>
          ) : coaches.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coaches.map((coach) => (
                <div key={coach.id} className="rounded-xl border border-white/20 bg-black/20 backdrop-blur-lg p-6 text-center">
                  {coach.profileImage ? (
                    <img 
                      src={coach.profileImage}
                      alt={coach.name}
                      className="w-16 h-16 rounded-full object-cover border-2 border-white/20 mx-auto mb-4"
                    />
                  ) : (
                    <div className={`w-16 h-16 bg-gradient-to-br ${coach.avatarColor} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <span className="text-lg font-bold text-white">{coach.initials}</span>
                    </div>
                  )}
                  <h3 className="text-lg font-bold text-white mb-1">{coach.name}</h3>
                  <div className="text-sky-400 font-semibold mb-3 text-sm">{coach.title}</div>
                  <p className="text-white/70 text-xs mb-4 leading-relaxed">{coach.description}</p>
                  
                  {coach.skills && coach.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 justify-center mb-4">
                      {coach.skills.map((skill, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs ${getSkillColor(coach.avatarColor)}`}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => {
                        console.log("=== EDIT BUTTON CLICKED ===", coach);
                        setModalState({ type: 'edit', coach });
                      }}
                      className="h-8 px-3 bg-gray-500 text-white hover:bg-gray-600 rounded-md text-xs font-medium"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteCoach(coach)}
                      className="h-8 px-3 bg-red-600 text-white hover:bg-red-500 rounded-md text-xs font-medium"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-white/60 py-8">
              No coaches added yet. Click "Add Coach" to get started.
            </div>
          )}
        </div>
      </div>
    </>
  );
};

// Also add debug to the top of CoachModal:
const CoachModal = ({ coach, onSave, onCancel }) => {
  console.log("=== COACH MODAL COMPONENT LOADED ===");
  console.log("Coach prop:", coach);
  console.log("onSave exists:", !!onSave);
  console.log("onCancel exists:", !!onCancel);

  // ... rest of your existing CoachModal code, but add this to the return:
  return (
    <div 
      className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4"
      style={{ zIndex: 9999 }} // Force very high z-index
      onClick={(e) => {
        console.log("=== MODAL BACKDROP CLICKED ===");
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <form 
        onSubmit={handleSubmit} 
        className="rounded-xl border border-white/20 bg-black/50 backdrop-blur-lg shadow-2xl p-8 max-w-md w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => {
          console.log("=== MODAL FORM CLICKED ===");
          e.stopPropagation();
        }}
      >
        <div className="mb-4 p-2 bg-red-500/20 rounded text-xs text-white">
          <strong>MODAL IS RENDERING!</strong><br/>
          Coach: {coach ? coach.name || "New Coach" : "null"}
        </div>
        
        {/* Rest of your existing form content */}
        {/* ... */}
      </form>
    </div>
  );
};
