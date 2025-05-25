var GDT = {};
(function () {
	var fs = typeof require != 'undefined' ? require('fs') : null;

	//dont' go more than one level deep.
	GDT.eventKeys = {
		gameplay: {
			afterGameReview: 'gameplay.afterGameReview', //{ company, game, reviews}
			beforeGameReview: 'gameplay.beforeGameReview', //{ company, game}
			afterReleaseGame: 'gameplay.afterReleaseGame', //{company, game}
			beforeReleaseGame: 'gameplay.beforeReleaseGame', //{company, game}
			contractFinished: 'gameplay.contractFinished',//{company, contract}
			contractStarted: 'gameplay.contractStarted',//{company, contract}
			engineFinished: 'gameplay.engineFinished',//{company, engine}
			engineStarted: 'gameplay.engineStarted',//{company}
			featureFinished: 'gameplay.featureFinished',//{company, feature}
			gameDefinitionCanceled: 'gameplay.gameDefinitionCanceled',//{company}
			researchCompleted: 'gameplay.researchCompleted',//{company, researchItem}
			researchStarted: 'gameplay.researchStarted',//{company, researchItem}
			salesCalculated: 'gameplay.salesCalculated',//{company, game}
			trainingFinished: 'gameplay.trainingFinished',//{staff, training}
			weekProceeded: 'gameplay.weekProceeded',//{company}
			staffApplicantsGenerated: 'gameplay.staffApplicantsGenerated',//{applicants, settings, rng}
			staffHired: 'gameplay.staffHired',//{character, applicant}
			staffFired: 'gameplay.staffFired'//{character}
		},
		ui: {
			dialogOpen: 'ui.dialogOpen',
			dialogClose: 'ui.dialogClose',
			contextMenuShowing: 'ui.contextMenuShowing',
			beforeShowingNotification: 'ui.beforeShowingNotification'
		},
		saves: {
			saving: 'saves.saving',
			loading: 'saves.loading',
			loaded: 'saves.loaded',
			newGame: 'saves.newGame'
		},
		mod: {
			loaded: 'mod.loaded',
			loadError: 'mod.loadError',
			allLoaded: 'mod.allLoaded'
		}
	};
	var _subscribers = {};

	var getSubscribers = function (key) {
		if (!_subscribers.hasOwnProperty(key)) {
			_subscribers[key] = [];
		}
		return _subscribers[key];
	};

	GDT.on = function (key, handler) {
		getSubscribers(key).push(handler);
	};

	GDT.off = function (key, handler) {
		getSubscribers(key).remove(handler);
	};

	GDT.fire = function (obj, key, data) {
		var subs = getSubscribers(key).slice();
		for (var i = 0; i < subs.length ; i++) {
			if (subs[i] != null) {
				try {
					subs[i].call(obj, data);
				} catch (e) {
					Logger.LogWarning('GDT event handler error', e);
				}
			}
		}
	};

	var _scriptsToLoad = 0;

	GDT.loadJs = function (scriptFiles, ready, error) {
		if (PlatformShim.ISWIN8)
			return;
		function acquireProperJsFileLocation(f, b) {
			var curScript = f.replace('/./', '/');
			var curPath = '';

			if (fs.existsSync(f)) {
				return f;
			}

			if (curScript.startsWith('./mods/') || curScript.startsWith('/mods/') || curScript.startsWith('mods/')) {
				curScript = curScript.replace(/^((.\/mods\/)|(\/mods\/)|(mods\/))(.*?)\//mg, "$5/");

				if (curScript.startsWith('./')) {
					curScript = curScript.substring(2);
				}

				curPath = b + '/mods_ws/' + curScript;

				if (!fs.existsSync(curPath)) {
					curPath = b + '/mods/' + curScript;

					if (!fs.existsSync(curPath)) {
						curPath = b + '/' + curScript;

						if (!fs.existsSync(curPath)) {
							curScript = f.replace('/./', '/');
							curScript = curScript.replace(/^((.\/mods\/)|(\/mods\/)|(mods\/))(.*?)\//mg, "");

							curPath = b + '/' + curScript;
						}
					}
				}

				if (!fs.existsSync(curPath)) {
					curPath = curPath.replace('/mods_ws/', '/mods/');
					return curPath;
				}

				return curPath;

			} else {
				var curCwd = b.replaceAll("\\", "/");
				if (curScript.startsWith(curCwd)) {
					curPath = curScript;
				} else {
					curPath = b + '/' + curScript;

					if (!fs.existsSync(curPath)) {
						curPath = curPath.replace('/mods/', '/mods_ws/');
						return curPath;
					}
				}
				return curPath;
			}
		}

		var cwd = PlatformShim.getScriptPath(false);
		if (cwd == "") {
			var path = require('path');
			cwd = path.dirname(process.execPath);
			var searchString = '/Contents/Frameworks/node-webkit';
			if (cwd.lastIndexOf(searchString) > -1) {
				cwd = cwd.substr(0, cwd.lastIndexOf(searchString)) + '/Contents/Resources/app.nw';
			}
		}
		cwd = cwd.replaceAll('\\', '/');
		if (!cwd.startsWith('/') && cwd.length > 1 && cwd[1] != ':')
			cwd = '/' + cwd;
		var searchString = '/Contents/Resources/app.nw/';
		if (cwd.lastIndexOf(searchString) > -1) {
			cwd = cwd.substr(cwd.lastIndexOf(searchString) + searchString.length, cwd.length - (cwd.lastIndexOf(searchString) + searchString.length));
		}

		if (Array.isArray(scriptFiles)) {
			for (var i = 0; i < scriptFiles.length; i++) {
				scriptFiles[i] = acquireProperJsFileLocation(scriptFiles[i], cwd);
			}
		} else {
			scriptFiles = [acquireProperJsFileLocation(scriptFiles, cwd)];
		}

		_scriptsToLoad++;
		requireLoad(scriptFiles, function () {
			_scriptsToLoad--;
			if (_scriptsToLoad == 0) {
				GDT.fire(this, GDT.eventKeys.mod.loaded);
			}
			if (ready) {
				ready();
			}
		}, function () {
			Logger.LogModError('Could not load mod one of the scripts {0} is missing or invalid!'.format(scriptFiles), undefined, 'Could not load mod one of the scripts {0} is missing or invalid!'.format(scriptFiles));
			_scriptsToLoad--;
			if (_scriptsToLoad == 0) {
				GDT.fire(this, GDT.eventKeys.mod.loadError);
			}
			if (error) {
				error();
			}
		});
	};

	GDT.getRelativePath = function () {
		var cwd = PlatformShim.getScriptPath(false);
		if (!cwd.startsWith('/') && cwd.length > 1 && cwd[1] != ':')
			cwd = '/' + cwd;
		return cwd;
	};

	GDT.addSettingsTab = function (text, content) {
		var id = GameManager.getGUID();
		var panel = $(document.createElement('div'));
		panel.attr({ id: id });
		panel.css({ width: '100%', height: 'auto', display: 'block' });
		panel.append(content);

		var tabs = $('#tabs').tabs();
		tabs.tabs("add", "#" + id, text);
		tabs.tabs("refresh");
		tabs.tabs('select', 0);

		$("#" + id).append(panel);

		return panel;
	};

	//UltimateLib introduced tabs in the settings menu but since v1.6 we have our own tabs.
	//for mod compatibility we rewire the ultimate lib tabs (if installed) to use ours instead.
	var ultimateLibFix = function () {
		if (typeof UltimateLib != 'undefined' && UltimateLib.Configuration) {
			//ultimatelib is already initialized but just in case nuke the init function
			UltimateLib.Configuration.init = function () { };

			//we need to 'un-nest' the settings panel from the ultimate lib modifications.
			var ultimateLibTabs = $('#UltimateLibConfigurationTabsList');
			var mainContent = $('#UltimateLibConfigurationDefaultTabPanel');
			var children = mainContent.children();
			ultimateLibTabs.remove();

			var tabs = $('#tabs');
			children.appendTo($('#settingsPanel'));
			$('#UltimateLibConfigurationTabs').remove();

			tabs.tabs('refresh');
			tabs.tabs('select', 0);
			//by now, we restored the original game content to our main settingsPanel and removed the ultimate lib custom tabs.
			//now we hook the addTab feature to add any modded content to the vanilla games panels.
			UltimateLib.Configuration.addTab = function (name, text, content) { GDT.addSettingsTab(text, content); };
			GDT.off(GDT.eventKeys.mod.loaded, ultimateLibFix);
		};
	};

	GDT.on(GDT.eventKeys.mod.loaded, ultimateLibFix);
})();