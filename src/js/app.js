App = {

	web3Provider: null,

	contracts: {},

	init: async function () {
		// Load pets.
		$.getJSON('../pets.json', function (data) {
			var petsRow = $('#petsRow');
			var petTemplate = $('#petTemplate');

			for (i = 0; i < data.length; i++) {
				petTemplate.find('.panel-title').text(data[i].name);
				petTemplate.find('img').attr('src', data[i].picture);
				petTemplate.find('.pet-breed').text(data[i].breed);
				petTemplate.find('.pet-age').text(data[i].age);
				petTemplate.find('.pet-location').text(data[i].location);
				petTemplate.find('.btn-adopt').attr('data-id', data[i].id);

				petsRow.append(petTemplate.html());
			}
		});

		return await App.initWeb3();
	},

	initWeb3: async function () {

		// Modern dapp browsers...
		if (window.ethereum) {
			App.web3Provider = window.ethereum;
			try {
				// Request account access
				await window.ethereum.enable();
			} catch (err) {
				// User denied account access
				alert(err.message);
				console.error("user denied account access");
			}
		}

		// Legacy dapp browsers...
		else if (window.web3) {
			App.web3Provider = window.web3.currentProvider;
		}

		// If no injected web3 instance is detected, fall back to Ganache
		else {
			App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
		}

		web3 = new Web3(App.web3Provider);

		return App.initContract();
	},

	initContract: function () {
		$.getJSON('AdoptAPet.json', function (data) {
			// Get the necessary contract artifact file and instantiate it with @truffle/contract
			let AdoptionArtifact = data;
			App.contracts.AdoptAPet = TruffleContract(AdoptionArtifact);

			// Set the provider for our contract
			App.contracts.AdoptAPet.setProvider(App.web3Provider);

			// Use our contract to retrieve and mark the adopted pets
			return App.markAdopted();
		})

		return App.bindEvents();
	},

	bindEvents: function () {
		$(document).on('click', '.btn-adopt', App.handleAdopt);
	},

	markAdopted: function (adopters, account) {
		var adoptionInstance;

		App.contracts.AdoptAPet.deployed().then(instance => {
				adoptionInstance = instance;

				return adoptionInstance.getAdopters.call();

			}).then(adopters => {
				for (let i = 0; i < adopters.length; i++) {
					if (adopters[i] !== '0x0000000000000000000000000000000000000000') {
						$('.panel-pet').eq(i).find('button').text('Success').attr('disable', true);
					}

				}
			})
			.catch(err => {
				alert(err.message);
				console.log(err.message)
			});

	},

	handleAdopt: function (event) {
		event.preventDefault();

		var petId = parseInt($(event.target).data('id'));

		let adoptionInstance;

		web3.eth.getAccounts((error, accounts) => {
			if (error) {
				alert(err.message);
				console.log(error);
			}

			let account = accounts[0];

			App.contracts.AdoptAPet.deployed().then(instance => {
					adoptionInstance = instance

					// Execute adopt as a transaction by sending account
					return adoptionInstance.adopt(petId, {
						from: account
					});
				})
				.then(result => App.markAdopted())
				.catch(err => {
					alert(err.message);
					console.log(err.message)
				});
		});
	}

};

$(function () {
	$(window).load(function () {
		App.init();
	});
});