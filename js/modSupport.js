var ModSupport = {};

//superb start

ModSupport.availableMods = [];
ModSupport.currentMods = [];

ModSupport.modsDescriptionsToLoad = 0;

ModSupport.loadMods = function () {
	if (ModSupport.modsDescriptionsToLoad == 0) {
		var enabledMods = JSON.parse(DataStore.getValue('enabledMods'));
		for (var i = 0; i < ModSupport.availableMods.length; i++) {
			ModSupport.availableMods[i].active = enabledMods.first(function (f) { return f == ModSupport.availableMods[i].id; }) != undefined;
		}
		var i = 0;
		GDT.on(GDT.eventKeys.mod.loaded, function (e) {
			ModSupport.loadMod(enabledMods, ++i);
		});
		GDT.on(GDT.eventKeys.mod.loadError, function (e) {
		});
		ModSupport.loadMod(enabledMods, i);
	}
};


ModSupport.loadMod = function (enabledMods, i) {
	try {
		if (enabledMods.length > i) {
			var mod = ModSupport.availableMods.first(function (f) {
				return f.id == enabledMods[i];
			});
			GDT.loadJs(['{0}/{1}'.format(mod.folder, mod.main)], function (util) {
				return;
			}, function (util) {
				var text = 'Could not load mod';
				Logger.LogModError(text, util, text);
			});
		} else {
			//all mods loaded
			GDT.fire({}, GDT.eventKeys.mod.allLoaded);
		}
	} catch (e) {
		Logger.LogModError('Could not load mod: {0}.'.format(enabledMods[i]), e, "Could not load mod: {0}.".format(enabledMods[i]));
	}
};

ModSupport.sortMods = function () {
	var enabledMods = JSON.parse(DataStore.getValue('enabledMods'));
	var modsToRemove = [];
	//enabled mods first
	for (var i = enabledMods.length - 1; i >= 0; i--) {
		var currentMod = ModSupport.availableMods.first(function (f) { return f.id == enabledMods[i]; });
		if (currentMod != undefined) {
			ModSupport.availableMods.remove(currentMod);
			ModSupport.availableMods.insertAt(0, currentMod);
			currentMod.active = true;
		} else {
			modsToRemove.push(enabledMods[i]);
		}
	}
	for (var i = 0; i < modsToRemove.length; i++) {
		enabledMods.remove(modsToRemove[i]);
	}
	if (modsToRemove.length > 0) {
		DataStore.setValue('enabledMods', JSON.stringify(enabledMods));
	}
	//order by dependencies
	var modsChecked = [];
	var checkMod = ModSupport.availableMods.first(function (f) { return f.id != modsChecked.first(function (x) { return x == f.id; }); });
	while (checkMod != undefined) {
		if (checkMod.dependencies != undefined) {
			var unresolvedDependency = undefined;
			for (var key in checkMod.dependencies) {
				if (checkMod.dependencies.hasOwnProperty(key)) {
					if (modsChecked.first(function (f) { return f == key; }) == undefined) {
						unresolvedDependency = key;
						if (ModSupport.availableMods.first(function (f) { return f.id == key; }) == undefined) {
							checkMod.unresolvedDependency = true;
						}
					}
				}
			}
			if (unresolvedDependency == undefined) {
				modsChecked.push(checkMod.id);
			}
			if (checkMod.unresolvedDependency) {
				modsChecked.push(checkMod.id);
				ModSupport.availableMods.remove(checkMod);
				ModSupport.availableMods.push(checkMod);
				if (enabledMods.first(function (f) { return f == checkMod.id; }) != undefined) {
					enabledMods.remove(checkMod.id);
					checkMod.active = false;
				}
			} else if (unresolvedDependency != undefined) {
				ModSupport.availableMods.remove(checkMod);
				var index = ModSupport.availableMods.indexOf(ModSupport.availableMods.first(function (f) { return f.id == unresolvedDependency; }));
				ModSupport.availableMods.insertAt(index + 1, checkMod);
			}
		} else {
			modsChecked.push(checkMod.id);
		}
		checkMod = ModSupport.availableMods.first(function (f) { return f.id != modsChecked.first(function (x) { return x == f.id; }); });
	};
};

ModSupport.disableMod = function (mod) {
	var enabledMods = JSON.parse(DataStore.getValue('enabledMods'));
	if (enabledMods.first(function (f) { return f == mod.id; }) != undefined) {
		enabledMods.remove(mod.id);
		mod.active = false;
		DataStore.setValue('enabledMods', JSON.stringify(enabledMods));
		for (var i = 0; i <= enabledMods.length; i++) {
			var modToRemove = ModSupport.availableMods.first(function (f) { return f.id == enabledMods[i] && f.dependencies != undefined && f.dependencies.hasOwnProperty(mod.id); });
			if (modToRemove != undefined) {
				ModSupport.disableMod(modToRemove);
			}
		}
	}
};

ModSupport.enableMod = function (mod) {

	if (!mod.unresolvedDependency) {
		var enabledMods = JSON.parse(DataStore.getValue('enabledMods'));
		if (enabledMods.first(function (f) { return f == mod.id; }) == undefined) {
			if (mod.dependencies != undefined) {
				for (var key in mod.dependencies) {
					ModSupport.enableMod(ModSupport.availableMods.first(function (f) { return f.id == key; }));
					enabledMods = JSON.parse(DataStore.getValue('enabledMods'));
				}
			}
			enabledMods.push(mod.id);
			mod.active = true;
			DataStore.setValue('enabledMods', JSON.stringify(enabledMods));
		}
	}
};

/* Missing Mods Check */
ModSupport.checkMissingMods = function (companyMods, activeMods) {
	var missingMods = [];
	if (companyMods.length == 1) {
		if (companyMods[0].id == "gdt-modAPI") {
			return missingMods;
		}
	}
	else if (companyMods.length < 1) {
		return missingMods;
	}
	missingMods = companyMods.filter(function (element) {
		var r = activeMods.first(function (item) {
			return element.id == item;
		});
		return !r;
	});

	return missingMods;
}
/*					*/
/*	Additional Mods	*/
ModSupport.checkAdditionalMods = function (companyMods, activeMods) {
	var additionalMods = [];

	if (activeMods.length == 1) {
		if (activeMods[0] == "gdt-modAPI") {
			return additionalMods;
		}
	} else if (activeMods.length < 1) {
		return additionalMods;
	}
	activeMods.forEach(function (element) {
		var foundMod = companyMods.first(function (item) {
			return element == item.id;
		});
		if (!foundMod) { // If the mod is not found in the game save collect it's package details
			additionalMods.push(ModSupport.availableMods.first(function (item) {
				return item.id == element;
			}));
		}
	});
	return additionalMods;
};
/*					*/

ModSupport.init = function () {
	var enabledMods = DataStore.getValue('enabledMods');
	if (enabledMods == undefined) {
		DataStore.setValue('enabledMods', JSON.stringify([]));
		enabledMods = [];
		ModSupport.currentMods = [];
	} else {
		ModSupport.currentMods = JSON.parse(enabledMods);
	}

	/*
	if (!PlatformShim.ISWIN8 && require) {
		var path = require('path');
		var cwd = path.dirname(process.execPath);
		var searchString = '/Contents/Frameworks/node-webkit';
		if (cwd.lastIndexOf(searchString) > -1) {
			cwd = cwd.substr(0, cwd.lastIndexOf(searchString)) + '/Contents/Resources/app.nw';
		}
		cwd = cwd.replaceAll('\\', '/');
		var fs = require('fs');

		var modFolder = cwd + '/mods/';
		var modWsFolder = cwd + '/mods_ws/';

		var folders = fs.readdirSync(modFolder);
		for (var i = 0; i < folders.length; i++) {
			try {
				var files = fs.readdirSync(modFolder + folders[i]);
				for (var j = 0; j < files.length; j++) {
					if (files[j] == 'package.json') {
						try {
							var packageDescription = require(modFolder + folders[i] + '/' + files[j]);
							
							var folder = modFolder + folders[i];
							
							packageDescription.folder = folder;
							
							var im = '';
							if (packageDescription.image && packageDescription.image.trim() !== '') {
								im = packageDescription.image.substr(0, 1) === '.' ? packageDescription.image.substr(1) : packageDescription.image;
								im = (folder + '/' + im).replaceAll('//', '/');
								var ff = path.resolve(im);
								if (!fs.existsSync(ff)) {
									im = packageDescription.folder + '/image.png';
								}
							}
							else {
								im = packageDescription.folder + '/image.png';
							}

							var fp = path.resolve(im);

							if (!fs.existsSync(fp)) {
								packageDescription.image = './images/mod-image.png';
							} else {
								packageDescription.image = im;
							}

							ModSupport.availableMods.push(packageDescription);
						} catch (e) {
							Logger.LogModError('Could not parse package.json: {0}'.format(modFolder + folders[i] + '/' + files[j]), e, 'Could not parse package.json: {0}'.format(cwd + '/mods/' + folders[i] + '/' + files[j]));
						}
					}
				}
			} catch (e) {
			}
		}

		// Load WS Mods if appliable
		if (GameFlags.IS_STEAM) {
			folders = fs.readdirSync(modWsFolder);
			for (var i = 0; i < folders.length; i++) {
				try {
					var files = fs.readdirSync(modWsFolder + folders[i]);
					for (var j = 0; j < files.length; j++) {
						if (files[j] == 'package.json') {
							try {
								var isNew = true;
								var folder = modWsFolder + folders[i];
								var packageDescription = require(modWsFolder + folders[i] + '/' + files[j]);

								packageDescription.folder = folder;

								var im = '';
								if (packageDescription.image && packageDescription.image.trim() !== '') {
									im = packageDescription.image.substr(0, 1) === '.' ? packageDescription.image.substr(1) : packageDescription.image;
									im = (folder + '/' + im).replaceAll('//', '/');
									var ff = path.resolve(im);
									if (!fs.existsSync(ff)) {
										im = packageDescription.folder + '/image.png';
									}
								}
								else {
									im = packageDescription.folder + '/image.png';
								}

								var fp = path.resolve(im);

								if (!fs.existsSync(fp)) {
									packageDescription.image = './images/mod-image.png';
								} else {
									packageDescription.image = im;
								}

								// Check if already available, and if so, compare versions and handle accordingly
								for (var q = 0; q < ModSupport.availableMods.length; q++) {
									if (ModSupport.availableMods[q].id == packageDescription.id) {
										isNew = false;
										if (compareVersions(packageDescription.version, ModSupport.availableMods[q].version) >= 0) {
											// WS Version is newer or equals manually installed MOD -> WS has priority
											packageDescription.isWorkshop = true;

											ModSupport.availableMods[q] = packageDescription;
										}
										break;
									}
								}

								// WS Mod has not been made avail so far, make it if isNew
								if (isNew) {
									packageDescription.isWorkshop = true;
									ModSupport.availableMods.push(packageDescription);
								}
							} catch (e) {
								Logger.LogModError('Could not parse package.json: {0}'.format(cwd + '/mods_ws/' + folders[i] + '/' + files[j]), e, 'Could not parse package.json: {0}'.format(cwd + '/mods_ws/' + folders[i] + '/' + files[j]));
							}
						}
					}
				} catch (e) {
				}
			}
		}

		ModSupport.loadMods();
	}
		*/

	function compareVersions(a, b) {
		var v1 = a.split('.');
		var v2 = b.split('.');
		for (var i = 0; i < Math.min(v1.length, v2.length); i++) {
			var res = v1[i] - v2[i];
			if (res != 0)
				return res;
		}
		return 0;
	}


	var setActiveModsInfo = function (s) {
		/* Save Mod Id, Author and Name To company.mods */
		GameManager.company.mods = [];
		ModSupport.currentMods.forEach(function (e, i) {
			var a = ModSupport.availableMods.first(function (mod) {
				return mod.id == e;
			});
			GameManager.company.mods.push({
				id: a.id,
				name: a.name,
				author: a.author,
				version: a.version
			});
		});
	};
	GDT.on(GDT.eventKeys.saves.saving, setActiveModsInfo);
};

//superb end