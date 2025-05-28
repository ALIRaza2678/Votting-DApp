const contractAddress = '0x8efa07537d46a5ed7761c6bd11c4cd5c31fb488d';
const abi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_voter",
				"type": "address"
			}
		],
		"name": "registerVoter",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [],
		"stateMutability": "nonpayable",
		"type": "constructor"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "candidateIndex",
				"type": "uint256"
			}
		],
		"name": "vote",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "candidate",
				"type": "string"
			}
		],
		"name": "Voted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": false,
				"internalType": "address",
				"name": "voter",
				"type": "address"
			}
		],
		"name": "VoterRegistered",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "candidates",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "logoUrl",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "voteCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "index",
				"type": "uint256"
			}
		],
		"name": "getCandidate",
		"outputs": [
			{
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "logoUrl",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "voteCount",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getCandidatesCount",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "candidateIndex",
				"type": "uint256"
			}
		],
		"name": "getVotes",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "_voter",
				"type": "address"
			}
		],
		"name": "isEligible",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "owner",
		"outputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			}
		],
		"name": "voters",
		"outputs": [
			{
				"internalType": "bool",
				"name": "isRegistered",
				"type": "bool"
			},
			{
				"internalType": "bool",
				"name": "hasVoted",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
];

let provider, signer, contract;

document.getElementById('connectButton').onclick = async () => {
  if (window.ethereum) {
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      provider = new ethers.providers.Web3Provider(window.ethereum);
      signer = provider.getSigner();
      contract = new ethers.Contract(contractAddress, abi, signer);

      const address = await signer.getAddress();
      document.getElementById('walletAddress').innerText = 'Wallet: ' + address;

      await loadCandidates();
      await loadVotes();
    } catch (e) {
      alert('Connection error: ' + e.message);
    }
  } else {
    alert('Please install MetaMask to use this app.');
  }
};

document.getElementById('registerVoter').onclick = async () => {
  const voter = document.getElementById('voterAddress').value;
  if (!voter) return alert("Please enter a voter's address.");
  try {
    const tx = await contract.registerVoter(voter);
    await tx.wait();
    alert('✅ Voter registered successfully!');
  } catch (e) {
    alert('❌ Error registering voter: ' + e.message);
  }
};

document.getElementById('voteButton').onclick = async () => {
  const candidate = document.getElementById('candidateSelect').value;

  if (!candidate) return alert("Please select a candidate to vote.");
  try {
    const tx = await contract.vote(candidate);
    await tx.wait();
    alert('🗳️ Vote cast successfully!');
    await loadVotes();
  } catch (e) {
    alert('❌ Voting error: ' + e.message);
  }
};

async function loadCandidates() {
  try {
    const count = await contract.getCandidatesCount();
    const select = document.getElementById('candidateSelect');
    select.innerHTML = '';
    for (let i = 0; i < count; i++) {
      const candidate = await contract.candidates(i);
      const option = document.createElement('option');
      option.value = i; // Store the index for voting
      option.text = candidate.name;
      select.appendChild(option);
    }
  } catch (e) {
    console.error('Error loading candidates:', e.message);
  }
}


let voteChart;

async function loadVotes() {
  try {
    const count = await contract.getCandidatesCount();
    const labels = [];
    const data = [];

    for (let i = 0; i < count; i++) {
      const candidate = await contract.getCandidate(i); // getCandidate gives name, logoUrl, voteCount
      labels.push(candidate.name);
      data.push(candidate.voteCount.toNumber());
    }

    // Destroy existing chart if it exists
    if (voteChart) voteChart.destroy();

    const ctx = document.getElementById('voteChart').getContext('2d');
    voteChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels,
        datasets: [{
          label: 'Votes',
          data,
          backgroundColor: '#0077cc',
          borderColor: '#005fa3',
          borderWidth: 1,
          borderRadius: 8
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (tooltipItem) => `Votes: ${tooltipItem.raw}`
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Number of Votes' }
          },
          x: {
            title: { display: true, text: 'Candidates' }
          }
        }
      }
    });

  } catch (e) {
    console.error('Error loading votes:', e.message);
  }
}


