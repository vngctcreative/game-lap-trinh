var UI = {};
(function () {
    UI.closeButtonTemplate = PlatformShim.ISWIN8 ? '<div class="closeDialogButtonWin8 metroCharacterButton">\ue10a</div>' : '<div class="closeDialogButton fontCharacterButton icon-remove"></div>';
    UI._resetCallbacks = [];
    UI.reset = function () {
        UI.resetStatusBar();
        for (var a = 0; a < UI._resetCallbacks.length; a++) UI._resetCallbacks[a]()
    };
    UI.isTransitionVisible;
    UI.fadeInTransitionOverlay = function (a) {
        UI.closeNewsletterWidget();
        UI.isTransitionVisible = !0;
        $("#transitionOverlay").show().css({
            opacity: 0
        }).transition({
            opacity: 1
        },
            800).delay(800).queue(function () {
                a && a();
                $(this).dequeue()
            })
    };
    UI.fadeOutTransitionOverlay = function (a) {
        UI.isTransitionVisible = !1;
        $("#transitionOverlay").transition({
            opacity: 0
        }, 400).delay(400).queue(function () {
            $(this).hide();
            a && a();
            $(this).dequeue()
        })
    };
    UI.createDefaultUISettings = function () {
        return {
            stage1SliderValues: [50, 50, 50],
            stage2SliderValues: [50, 50, 50],
            stage3SliderValues: [50, 50, 50],
            selectedGameFeatures: ["Text Based", "Basic Sound"],
            selectedConsoleFeatures: []
        }
    };
    UI.getShortNumberString = function (a) {
        var b;
        1E6 <= Math.abs(a) ? b = "{0}M".localize().format(UI.getLongNumberString(Math.roundToDecimals(a / 1E6, 1))) : 1E3 <= Math.abs(a) && (b = "{0}K".localize().format(UI.getLongNumberString(Math.roundToDecimals(a / 1E3, 1))));
        b || (b = Math.roundToDecimals(a, 1));
        return b
    };
    UI.getPercentNumberString = function (a) {
        return "{0} %".localize().format(Math.roundToDecimals(a, 1))
    };
    UI.getLongNumberString = function (a) {
        if (Math.floor(a) == a) return a = Math.floor(a).toLocaleString(), a.substr(0, a.length - 3);
        for (a = a.toLocaleString();
            "0" == a[a.length -
            1];) a = a.substr(0, a.length - 1);
        return a
    };
    UI.getHtmlText = function (a) {
        a = a.replace(/\n/g, "<br />");
        return window.PlatformShim.toStaticHtml(a)
    };
    UI._showFeatureList = function (a, b) {
        PlatformShim.execUnsafeLocalFunction(function () {
            $.modal.close()
        });
        UI.showFeatureList(a.features, {
            onClose: function () {
                GameManager.removeFromActiveNotifications(a);
                b && b()
            }
        })
    };
    UI.getCharUnderCursor = function () {
        var a = CanvasManager.characterStage;
        if (a.mouseInBounds)
            for (var b = a.mouseX, a = a.mouseY, c = 0; c < VisualsManager.characterOverlays.length; c++) {
                var f =
                    VisualsManager.characterOverlays[c],
                    g = f.x + VisualsManager.toScreenCoordinates(47, CanvasManager.globalScale),
                    n = f.y + VisualsManager.toScreenCoordinates(37, CanvasManager.globalScale),
                    r = 187 * CanvasManager.globalScale,
                    p = 271 * CanvasManager.globalScale;
                if (b >= g && b <= g + r && a >= n && a <= n + p) return f.character
            }
        return null
    };
    UI.salesContainerClick = function (b, c) {
        if (a()) {
            var f = b.screenX,
                l = b.screenY,
                g = [],
                n = function (a) {
                    var b = $("#takeOffMarketDialog");
                    b.find(".confirmActionButton").clickExclOnce(function () {
                        Sound.click();
                        a();
                        b.dialog("close")
                    });
                    b.find(".cancelActionButton").clickExclOnce(function () {
                        Sound.click();
                        b.dialog("close")
                    });
                    b.gdDialog({
                        close: !0,
                        popout: !0,
                        onClose: function () {
                            GameManager.resume(!0)
                        }
                    })
                },
                r = GameManager.company.gameLog.first(function (a) {
                    return a.id === c
                });
            if (!r || !r.flags.mmo || GameManager.company.currentGame && !1 !== GameManager.company.currentGame.flags.isExtensionPack && GameManager.company.currentGame.sequelTo == r.id) {
                var p = GameManager.company.licencedPlatforms.first(function (a) {
                    return a.id === c
                });
                p && g.push({
                    label: "Take off market".localize("menu item"),
                    action: function () {
                        Sound.click();
                        n(function () {
                            p.saleCancelled = !0;
                            Media.createConsoleEndStory(p)
                        })
                    }
                })
            } else g.push({
                label: "Take off market".localize("menu item"),
                action: function () {
                    Sound.click();
                    n(function () {
                        r.flags.saleCancelled = !0;
                        Media.createMMOEndStory(r)
                    })
                }
            });
            1 <= g.length && UI._showContextMenu("salesContainer", g, f, l)
        }
    };
    UI._showContextMenu = function (b, c, f, l) {
        a() && (GDT.fire(this, GDT.eventKeys.ui.contextMenuShowing, {
            type: b,
            items: c
        }), 0 < c.length && (GameManager.pause(!0), Sound.click(), UI.showContextMenu(c, {
            x: f,
            y: l
        })))
    };
    var a = function () {
        return UI.isMenuOpen() ? (Sound.click(), GameManager.resume(!0), UI.closeContextMenu(), !1) : VisualsManager.isAnimatingScroll ? !1 : !0
    };
    UI.overrideClick;
    UI.containerClick = function (d) {
        if (UI.overrideClick) UI.overrideClick(d);
        else if (a()) {
            var f = d.x;
            d = d.y;
            var m = GameManager.company,
                l = [],
                g = "primary";
            void 0 === m.flags.currentZone || 1 === m.flags.currentZone ? b(m, l) : (c(m, l), g = "secondary");
            UI._showContextMenu(g, l, f, d)
        }
    };
    var b = function (a, b) {
        var c = 1 < a.currentLevel ? UI.getCharUnderCursor() : a.staff[0];
        c && 1 != a.currentLevel || (GameManager.company.isCurrentlyDevelopingGame() && -1 != GameManager.company.researchCompleted.indexOf(Research.Marketing) && 0 < GameManager.getDevFeatureLogCount() && b.push({
            label: "Marketing...".localize("menu item"),
            icon: "./images/context menu icons/icon_marketing.svg",
            action: function () {
                Sound.click();
                Tutorial.marketing();
                GameManager.company.notifications.push(new Notification("{MarketingList}"));
                GameManager.showPendingNotifications()
            }
        }), GameManager.isIdle() && !GameManager.currentEngineDev &&
        0 < a.staff.filter(function (a) {
            return a.state === CharacterState.Idle
        }).length && (b.push({
            label: "Develop New Game...".localize("menu item"),
            icon: "./images/context menu icons/icon_new_game.svg",
            action: function () {
                Sound.click();
                GameManager.flags.selectGameActive = !1;
                GameManager.flags.createPack = !1;
                GameManager.transitionToState(State.CreateGame)
            }
        }), -1 != a.researchCompleted.indexOf(Research.Sequels) && 0 < a.getPossibleGamesForSequel().length && b.push({
            label: "Develop Sequel...".localize("menu item"),
            icon: "./images/context menu icons/icon_sequel.svg",
            action: function () {
                Sound.click();
                GameManager.flags.selectGameActive = !0;
                GameManager.flags.createPack = !1;
                GameManager.transitionToState(State.CreateGame)
            }
        }), -1 != a.researchCompleted.indexOf(Research.expansionPack) && 0 < a.getPossibleGamesForPack().length && b.push({
            label: "Develop Expansion Pack...".localize("menu item"),
            icon: "./images/context menu icons/icon_expansion_pack.svg",
            action: function () {
                Sound.click();
                GameManager.flags.selectGameActive = !0;
                GameManager.flags.createPack = !0;
                GameManager.transitionToState(State.CreateGame)
            }
        }),
            a.canDevelopEngine() && b.push({
                label: "Create Custom Engine...".localize("menu item"),
                icon: "./images/context menu icons/icon_customengine.svg",
                action: function () {
                    Sound.click();
                    a.notifications.push(new Notification("{CreateEngine}", "", "", 0));
                    GameManager.showPendingNotifications()
                }
            }), a.flags.contractsEnabled && b.push({
                label: "Find Contract Work...".localize("menu item"),
                icon: "./images/context menu icons/icon_contract.svg",
                action: function () {
                    Sound.click();
                    Tutorial.contracts();
                    GameManager.uiSettings.selectedContractType =
                        "generic";
                    a.notifications.push(new Notification("{FindContractWork}"));
                    GameManager.showPendingNotifications()
                }
            }), a.flags.publishersEnabled && b.push({
                label: "Find Publishing Deal...".localize("menu item"),
                icon: "./images/context menu icons/icon_publishingdeal.svg",
                action: function () {
                    Sound.click();
                    GameManager.uiSettings.selectedContractType = "gameContract";
                    Tutorial.publishers();
                    a.notifications.push(new Notification("{FindContractWork}"));
                    GameManager.showPendingNotifications()
                }
            })), 1 < a.currentLevel && b.push({
                label: "Staff List...".localize("menu item"),
                icon: "./images/context menu icons/icon_staff.svg",
                action: function () {
                    Sound.click();
                    UI.showStaffList()
                }
            }), a && a.gameLog && 0 < a.gameLog.length && b.push({
                label: "Game History...".localize("menu item"),
                icon: "./images/context menu icons/icon_game_history.svg",
                action: function () {
                    Sound.click();
                    UI.showGameHistory()
                }
            }));
        c && (c.state != CharacterState.Researching && c.state != CharacterState.Training && c.state != CharacterState.Vacation && (a.flags.patchData && a.flags.patchData.patchAvailableUntil > GameManager.gameTime && b.push({
            label: "Develop patch ({0})".localize("menu item").format(UI.getShortNumberString(a.flags.patchData.patchCost)),
            icon: "./images/context menu icons/icon_patch.svg",
            action: function () {
                GameManager.uiSettings.selectedChar = c.id;
                Sound.click();
                var b = Training.patchGame;
                b.cost = a.flags.patchData.patchCost;
                a.flags.patchData.patchAvailableUntil = 0;
                GameManager.research(b, "training");
                GameManager.resume(!0)
            }
        }), a.researchEnabled && c.canStartResearch() && b.push({
            label: "Research...".localize("menu item"),
            iconStyleClass: "research",
            icon: "./images/context menu icons/icon_search.svg",
            action: function () {
                Sound.click();
                Tutorial.researchMenu();
                GameManager.uiSettings.selectedChar = c.id;
                GameManager.company.notifications.push(new Notification("{Research}"));
                GameManager.showPendingNotifications()
            }
        }), 0 < a.gameLog.length && a.gameLog.some(function (a) {
            return a.canDoPostMortem()
        }) && b.push({
            label: "Generate game report...".localize("menu item"),
            icon: "./images/context menu icons/icon_game_report.svg",
            action: function () {
                Sound.click();
                GameManager.flags.selectGameActive = !0;
                GameManager.flags.createPack = !1;
                var a = GameManager.gameId;
                UI.showGameHistory(function () {
                    if (a ==
                        GameManager.gameId) {
                        GameManager.flags.selectGameActive = !1;
                        var b = GameManager.flags.selectedGameId;
                        if (b) {
                            var d = GameManager.company.getGameById(b);
                            d && (GameManager.uiSettings.selectedChar = c.id, c.flags.postMortemGameId = b, b = Training.postMortem, b.duration = b.baseDuration * General.getGameSizeDurationFactor(d.gameSize), GameManager.research(b, "training"), GameManager.resume(!0))
                        }
                    }
                }, !1, !0)
            }
        }), 1 < a.currentLevel && (b.push({
            label: "Train...".localize("menu item"),
            icon: "./images/context menu icons/icon_train.svg",
            action: function () {
                Sound.click();
                GameManager.uiSettings.selectedChar = c.id;
                (0 != c.id || 1 < GameManager.company.maxStaff) && (0 === c.id || c.flags.didWelcomeTraining) && Tutorial.training();
                GameManager.company.notifications.push(new Notification("{Training}"));
                GameManager.showPendingNotifications()
            }
        }), c.flags.needsVacation && b.push({
            label: "Send on Vacation".localize("menu item"),
            icon: "./images/context menu icons/icon_vacation.svg",
            action: function () {
                Sound.click();
                c.goOnVacation();
                GameManager.resume(!0)
            }
        }))), 0 != c.id && b.push({
            label: "Fire...".localize("menu item"),
            icon: "./images/context menu icons/icon_staff_fire.svg",
            action: function () {
                Sound.click();
                UI.showFireStaffPrompt(c);
                GameManager.resume(!0)
            }
        }))
    },
        c = function (a, b) {
            var c = a.flags.currentZone,
                f = 0 === c ? GameManager.currentHwProject : GameManager.currentRnDProject;
            null != f ? b.push({
                label: "Cancel Project...".localize("menu item"),
                action: function () {
                    Sound.click();
                    var a = $("#cancelProjectDialog");
                    a.find(".confirmActionButton").clickExclOnce(function () {
                        Sound.click();
                        GameManager.cancelProject(f);
                        a.dialog("close")
                    });
                    a.find(".cancelActionButton").clickExclOnce(function () {
                        Sound.click();
                        a.dialog("close")
                    });
                    a.gdDialog({
                        close: !0,
                        popout: !0,
                        onClose: function () {
                            GameManager.resume(!0)
                        }
                    })
                }
            }) : (0 < General.getAvailableProjects(a, c).length && b.push({
                label: "Start Project...".localize("menu item"),
                action: function () {
                    Sound.click();
                    UI.showGenericProjectWindow(c)
                }
            }), 0 === c && GameManager.canDevelopConsole() && b.push({
                label: "Develop Console...".localize("menu item"),
                action: function () {
                    Sound.click();
                    Tutorial.devConsole();
                    a.notifications.push(new Notification("{DevelopConsole}", "", "", 0));
                    GameManager.showPendingNotifications()
                }
            }))
        };
    UI.setVisible = function (a) {
        a = $(a);
        a.get(0) && (a.removeClass("collapsed"), a.addClass("visible"))
    };
    UI.setInVisible = function (a) {
        a = $(a);
        a.get(0) && (a.removeClass("visible"), a.addClass("collapsed"))
    };
    UI.showSnappedView = function () {
        this.setVisible("#snappedScreen")
    };
    UI.hideSnappedView = function () {
        this.setInVisible("#snappedScreen")
    };
    UI.toggleHelpPanel = function () {
        var a = $("#helpPanel");
        UI.populateHelpPage(a);
        GameManager.pause(!0, !0);
        a.gdDialog({
            popout: !0,
            zIndex: 8E3,
            close: !0,
            onClose: function () {
                GameManager.resume(!0,
                    !0)
            }
        })
    };
    $.fn.gdSlider = function (a) {
        var b = {
            autoHeight: !1,
            autoWidth: !1,
            arrowsNav: !0,
            fadeinLoadedSlide: !1,
            controlNavigationSpacing: 5,
            controlNavigation: "thumbnails",
            imageScaleMode: "none",
            imageAlignCenter: !1,
            loop: !1,
            loopRewind: !1,
            keyboardNavEnabled: !0,
            navigateByClick: !1,
            addActiveClass: !0
        };
        $.extend(b, a);
        this.royalSlider(b)
    };
    UI.populateHelpPage = function (a) {
        $(a).find("#devStages").accordion({
            icons: !1,
            autoHeight: !1,
            active: !1,
            collapsible: !0
        });
        a = $(a).find("#helpMessagesContainer");
        a.empty();
        var b = "Previously shown tutorial messages for the active game are shown here. To see tutorial messages here, please continue an existing game or start a new one. You can start a new game via the app bar.".localize();
        if (GameManager.company) {
            var c = $("<div></div>"),
                f = Tutorial.getAllShownMessages(GameManager.company);
            if (0 == f.length) a.append(b);
            else {
                f = f.reverse();
                for (b = 0; b < f.length; b++) {
                    var g = f[b];
                    c.append($("<h3></h3>").text(g.heading));
                    c.append($("<p></p>").html(g.msg.replaceAll("{n}", "<br/>")))
                }
                a.append(c);
                c.accordion({
                    icons: !1,
                    autoHeight: !1,
                    collapsible: !0
                })
            }
        } else a.append($("<span></span>").text(b))
    };
    UI.toggleSettingsPanel = function () {
        var a = $("#settingsPanel");
        UI.populateSettingsPanel(a);
        GameManager.pause(!0, !0);
        a.gdDialog({
            popout: !0,
            zIndex: 8E3,
            close: !0,
            onClose: function () {
                DataStore.commit && DataStore.commit();
                GameManager.resume(!0, !0)
            }
        });
        a = a.find("#toggleFullscreenButton");
        UI.maxFont(void 0, a, 34);
        UI.showLocalizationCredits(GameManager.getPreferredLanguage(), $("#localizationCredits"), $(".localizationDiscussion"))
    };
    UI.toggleModsPanel = function () {
        UI.populateModsPanel();
        GameManager.pause(!0, !0);
        UI._prepareGreenworks && UI._prepareGreenworks();
        $("#modsPanel").dialog({
            width: 800,
            draggable: !1,
            modal: !0,
            resizable: !1,
            show: "fade",
            zIndex: 8E3,
            open: function () {
                var a = $(UI.closeButtonTemplate);
                a.zIndex = 8E3;
                a.clickExclOnce(function () {
                    Sound.click();
                    $("#modsPanel").dialog("close");
                    GameManager.resume(!0)
                });
                $(this).parents(".ui-dialog:first").append(a);
                $(this).siblings(".ui-dialog-titlebar").remove();
                $(this).parents(".ui-dialog:first").addClass("tallWindow");
                $(this).parents(".ui-dialog:first").addClass("windowBorder");
                $(this).parents(".ui-dialog:first").removeClass("ui-widget-content");
                UI.maxFont(void 0, $("#modsPanelButtonMods"), 18);
                UI.maxFont(void 0, $("#modsPanelButtonWorkshop"), 18);
                UI.maxFont(void 0, $("#modsPanelButtonUpload"), 18);
                UI.maxFont(void 0, $("#modsPanelButtonUpdate"), 18)
            },
            close: function () {
                $(this).dialog("destroy");
                this.style.cssText = "display:none;";
                DataStore.commit && DataStore.commit();
                GameManager.resume(!0, !0)
            }
        })
    };
    UI._getElementForMod = function (a) {
        var b = $("#modsButtonTemplate").clone();
        b.find(".modName").text(a.name);
        b.find(".author").text(a.author);
        b.find(".description").addClass("modDescription").text(a.description);
        a.url ? (b.find(".website").append('<a href="{0}">{1}</a>'.format(a.url, "Mod Website".localize())), b.find(".website").clickExcl(function (b) {
            PlatformShim.openUrlExternal(a.url)
        })) : b.find(".website").append("No Website".localize());
        a.active && b.addClass("activeMod");
        a.unresolvedDependency && b.addClass("dependencyWrong");
        b.find(".modVersion").text("v" + a.version);
        "" !== a.image && b.find(".modImage").css({
            backgroundImage: "url('" + a.image + "')"
        });
        if (!0 === a.isWorkshop) {
            var c = $(document.createElement("img")).addClass("unsubscribe-" +
                a.id).attr({
                    src: "./images/greenworks/steam-16x64.png"
                });
            b.find(".modopts").append(c)
        }
        b.enableActiveClassOnClick();
        return b
    };
    UI.populateModsPanel = function () {
        var a = $("#modsPanelContent");
        a.empty();
        ModSupport.sortMods();
        for (var b = 0; b < ModSupport.availableMods.length; b++) {
            var c = ModSupport.availableMods[b],
                f = UI._getElementForMod(c);
            a.append(f);
            f = f.get(0);
            f.mod = c;
            f.onclick = function () {
                Sound.click();
                this.mod.active ? ModSupport.disableMod(this.mod) : this.mod.unresolvedDependency || ModSupport.enableMod(this.mod);
                UI.populateModsPanel()
            }
        }
    };
    UI.populateSettingsPanel = function (a) {
        SettingsGameplay.updateValuesOnPanel(a);
        a.find(".languageSelection").val(GameManager.getPreferredLanguage()).change(function (a, b) {
            var c = $(this).val();
            GameManager.setPreferredLanguage(c)
        });
        a.find(".hintsToggle").val(GameManager.areHintsEnabled() ? "on" : "off").change(function (a, b) {
            var c = $(this).val();
            GameManager.setHintsEnabled("on" === c)
        });
        a.find(".musicToggle").val(Sound.getMusicAllowed() ? "on" : "off").change(function (a, b) {
            var c = $(this).val();
            Sound.allowMusic("on" === c)
        });
        a.find(".fxToggle").val(Sound.getFxAllowed() ? "on" : "off").change(function (a, b) {
            var c = $(this).val();
            Sound.allowFx("on" === c)
        });
        a.find(".volumeSlider").slider({
            min: 0,
            max: 100,
            range: "min",
            value: Sound.getMasterVolume(),
            animate: !1,
            slide: function (a, b) {
                var c = b.value;
                isNaN(c) || Sound.setMasterVolume(c)
            }
        });
        var b = a.find("#toggleFullscreenButton");
        PlatformShim.ISWIN8 ? a.find("#windowSettings").hide() : b.clickExclOnce(function () {
            var b = PlatformShim.toggleFullscreen();
            DataStore.setValue("windowed",
                !b);
            a.dialog("close")
        });
        UI._populateMessagesGrid(a);
        a.find("#tabs").tabs();
        UI.createDraggable(a)
    };
    UI._populateMessagesGrid = function (a) {
        var b = a.find(".messagesGrid");
        b.empty();
        Draggable.get(b) && Draggable.get(b).kill();
        var c = 515,
            c = c / 2;
        h = 46;
        var f = 0,
            g = [],
            n = [],
            r;
        for (r in NotificationType)
            if (NotificationType.hasOwnProperty(r)) {
                var p = NotificationType[r];
                if (p != NotificationType.AutoPopup && p != NotificationType.Default) {
                    n.push(NotificationTypeDisplayString[r]);
                    var s = $(PlatformShim.toStaticHtml('<div class="messagesConfigButton orangeButton">{0}</div>'.format(NotificationTypeDisplayString[r]))).attr("gdt-type",
                        r).appendTo(b);
                    Notification.shouldShowInSideBar(p) && TweenMax.set(s, {
                        x: c
                    });
                    f++;
                    g.push(r)
                }
            } $(".messagesConfigButton").css("font-size", UI._getMaxFontSize("{0}pt {1}", UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" : "Open Sans", 16, 2, c + 60, h, n));
        var u = function (a, b) {
            if (!(0 >= a.length)) {
                var c = a.attr("gdt-type");
                Notification.setShouldShowInSideBar(c, b)
            }
        };
        for (i = 0; i < 2 * f; i++) n = Math.floor(i / 2), y = n * h, x = i * c % (2 * c),
            function (a) {
                var d = {
                    position: "absolute",
                    width: c - 1,
                    height: h - 1,
                    top: y,
                    left: x
                },
                    d = $("<div/>").css(d);
                d.addClass("cell").addClass(a %
                    2 ? "odd" : "even");
                d.prependTo(b).clickExcl(function () {
                    Sound.click();
                    v(b.find('.messagesConfigButton[gdt-type="{0}"]'.format(g[a])))
                })
            }(n);
        TweenMax.set(b, {
            height: f * h + 1,
            width: 2 * c + 1
        });
        var t = function (a) {
            a = a.parent();
            if (!a) return null;
            var b = Draggable.get(a);
            return b ? b : t(a)
        },
            q = function (a) {
                var c = t(b.parent());
                c && (a ? c.enable() : c.disable())
            },
            v = function (a) {
                if (!(0 >= a.length)) {
                    var b = 0 < a[0]._gsTransform.x ? 0 : c;
                    TweenMax.to(a, 0.4, {
                        x: b,
                        ease: Power2.easeOut
                    });
                    u(a, 0 < b)
                }
            };
        Draggable.create(a.find(".messagesConfigButton"), {
            bounds: b,
            edgeResistance: 0.65,
            type: "x",
            cursor: "pointer",
            throwProps: !0,
            autoScroll: !0,
            liveSnap: !1,
            snap: {
                x: function (a) {
                    return Math.round(a / c) * c
                },
                y: function (a) {
                    return Math.round(a / h) * h
                }
            },
            onDragStart: function () {
                q(!1)
            },
            onDragEnd: function () {
                q(!0)
            },
            onClick: function () {
                Sound.click();
                v($(this.target))
            },
            onThrowComplete: function () {
                u($(this.target), 0 < this.target._gsTransform.x)
            }
        })
    };
    UI.showAboutBadge = function () {
        var a = $("#aboutBadge");
        0 < a.length && (a.css("opacity", 0).show(), a.transit({
            opacity: 1
        }, 400))
    };
    UI.hideAboutBadge =
        function () {
            var a = $("#aboutBadge");
            0 < a.length && a.transit({
                opacity: 0
            }, 400, null, function () {
                a.hide()
            })
        };
    UI.showLocalizationCredits = function (a, b, c) {
        if (b && 1 != !b.length && (c && 1 == c.length && c.empty(), b.empty(), "en" != a)) {
            var f = !1;
            Languages[a + "_moderators"] && (b.append($("<h3></h3>").text("Moderators".localize("localization"))), b.append($("<small></small>").text(Languages[a + "_moderators"])), f = !0);
            Languages[a + "_topContributors"] && (b.append($("<h3></h3>").text("Top Contributors".localize("localization"))), b.append($("<small></small>").text(Languages[a +
                "_topContributors"])), f = !0);
            Languages[a + "_qualityAssurance"] && (b.append($("<h3></h3>").text("Quality Assurance".localize("localization"))), b.append($("<small></small>").text(Languages[a + "_qualityAssurance"])));
            Languages[a + "_html"] && b.append($(Languages[a + "_html"]));
            c && 1 == c.length && Languages[a + "_discussionLink"] && (c.append($('<a href="{0}"></a>'.format(Languages[a + "_discussionLink"])).text("Discuss translation".localize())), f = !0);
            f && (b.append($("<br />")), b.append($("<small></small>").text("Thanks to the many unnamed contributors who greatly helped translating the game!".localize())),
                b.append($("<br />")))
        }
    };
    UI.Font = {
        isInstalled: function (a) {
            a = a.replace(/['"<>]/g, "");
            var b = document.body,
                c = document.createElement("div"),
                f = !1;
            a && (c.innerHTML = "<b style=\"display:inline !important; width:auto !important; font:normal 10px/1 'X',sans-serif !important\">mmmmmmmmwwwwwwww</b><b style=\"display:inline !important; width:auto !important; font:normal 10px/1 'X',monospace !important\">mmmmmmmmwwwwwwww</b>".replace(/X/g, a), c.style.cssText = "position: absolute; visibility: hidden; display: block !important",
                b.insertBefore(c, b.firstChild), a = c.getElementsByTagName("b"), f = a[0].offsetWidth === a[1].offsetWidth, b.removeChild(c));
            return f
        }
    };
    $(document).ready(function () {
        UI.IS_SEGOE_UI_INSTALLED = UI.Font.isInstalled("Segoe UI")
    });
    var f = jQuery.fn.empty;
    jQuery.fn.empty = function () {
        var a = Draggable.get(this);
        null != a && a.kill();
        return f.apply(this, arguments)
    };
    UI.createDraggable = function (a) {
        var b = Draggable.get(a);
        null != b && b.kill();
        a.find(".ui-slider").attr("data-clickable", !0);
        Draggable.create(a, {
            type: "scrollTop",
            onPress: function (a) {
                $(a.target).closest(".selectorButton").addClass("active")
            },
            onRelease: function (a) {
                $(a.target).closest(".selectorButton").removeClass("active")
            },
            edgeResistance: 0.75,
            throwProps: !0,
            cursor: "auto"
        })
    }
})();
(function () {
    GameFlags.RCLICK_MENU && document.addEventListener("contextmenu", function (a) {
        a.preventDefault();
        UI.toggleMainMenu();
        return !1
    }, !1);
    GameFlags.ESC_MENU && window.addEventListener("keydown", function (a) {
        if (27 == a.which && !a.defaultPrevented) return UI.toggleMainMenu(), a.preventDefault(), !1
    }, !1);
    var a = !1;
    UI.disableMainMenu = function () {
        a = !0
    };
    UI.enableMainMenu = function () {
        a = !1
    };
    UI.isMainMenuDisabled = function () {
        return a
    };
    UI.toggleMainMenu = function () {
        if (!UI.isMainMenuDisabled())
            if (b) c();
            else {
                UI.closePanels();
                var a = $("#mainMenu"),
                    d = a.find(".continueButton");
                GameManager.company || SplashScreen.isVisible() && GameManager.getGameToContinue() ? (d.removeClass("disabled"), d.clickExclOnce(function () {
                    Sound.click();
                    c();
                    GameManager.company || GameManager.continueGame()
                })) : (d.addClass("disabled"), d.clickExclOnce());
                a.find(".newButton").clickExclOnce(function () {
                    Sound.click();
                    GameManager.resume(!0, !0);
                    SplashScreen.isVisible() || UI.hideAboutBadge();
                    UI.closeNewsletterWidget();
                    GameManager.startNewGame()
                });
                d = a.find(".saveButton");
                GameManager.company ? (d.removeClass("disabled"), d.clickExclOnce(function () {
                    Sound.click();
                    c();
                    GameManager.saveActualGame()
                })) : (d.addClass("disabled"), d.clickExclOnce());
                a.find(".loadButton").clickExclOnce(function () {
                    Sound.click();
                    GameManager.openLoadView();
                    c()
                });
                a.find(".highscoreButton").clickExclOnce(function () {
                    Sound.click();
                    UI.toggleHighScorePanel();
                    c()
                });
                a.find(".achievementsButton").clickExclOnce(function () {
                    Sound.click();
                    UI.toggleAchievementPanel();
                    c()
                });
                a.find(".settingsButton").clickExclOnce(function () {
                    Sound.click();
                    UI.toggleSettingsPanel();
                    c()
                });
                PlatformShim.ISWIN8 || a.find(".modsButton").clickExclOnce(function () {
                    Sound.click();
                    UI.toggleModsPanel();
                    c()
                });
                a.find(".helpButton").clickExclOnce(function () {
                    Sound.click();
                    UI.toggleHelpPanel();
                    c()
                });
                a.find(".version").text((GameFlags.G782 ? "V" : "v") + PlatformShim.getVersion());
                a = a.find(".exitButton");
                PlatformShim.ISWIN8 ? a.hide() : a.clickExclOnce(function () {
                    Sound.click();
                    window.close()
                });
                GameManager.pause(!0, !0);
                $("#mainMenu").gdDialog({
                    popout: !0,
                    close: !0,
                    zIndex: 1E4,
                    onClose: function () {
                        GameManager.resume(!0,
                            !0);
                        SplashScreen.isVisible() || UI.hideAboutBadge();
                        UI.closeNewsletterWidget();
                        b = !1
                    },
                    onOpen: function () {
                        UI.showAboutBadge();
                        UI.showNewsletterWidget()
                    }
                });
                b = !0
            }
    };
    var b = !1,
        c = function () {
            $("#mainMenu").dialog("close");
            b = !1
        }
})();
(function () {
    UI.resetStatusBar = function () {
        for (var a = 0; a < b.length; a++) createjs.Tween.removeTweens(b[a]._target), b[a]._target.remove();
        b = [];
        UI.updateStatusBar(GameManager.company)
    };
    UI.updateStatusBar = function (b) {
        if (b) {
            c(b);
            var m = b.cash,
                l = UI.getShortNumberString(m),
                g = $("#money"),
                n = g.get(0);
            n && (0 > m ? (g.removeClass("green"), g.addClass("red")) : (g.removeClass("red"), g.addClass("green")), n.innerText = l);
            m = b.getCurrentDate();
            m = "Y{0} M{1} W{2}".localize("date display").format(m.year, m.month, m.week);
            f || (f = $("#date"));
            f && f.text(m);
            d || (d = $("#weekProgression"));
            if (d && (m = GameManager.company.currentWeek % 4 + 1, m -= Math.floor(m), m = 0.25 >= m ? 0 : 0.5 >= m ? 1 : 0.75 >= m ? 2 : 3, d.currentProgress != m)) {
                l = [1, 2, 3, 4];
                for (g = 0; g < l.length; g++) d.find(".p" + l[g]).css("opacity", g <= m ? 1 : 0);
                d.currentProgress = m
            }
            m = UI.getShortNumberString(b.fans);
            if (l = $("#fans").get(0)) l.innerText = "{0} Fans".localize().format(m);
            a || (a = $("#trendContainer"));
            b && b.flags.trends ? a.trend != b.flags.trends.currentTrend && (a.trend = b.flags.trends.currentTrend, a.trend && a.trend.label ?
                a.text(a.trend.label).addClass("statusBar").show() : a.removeClass("statusBar").hide()) : a.hide()
        }
    };
    var a, b = [];
    (function () {
        GameManager.addTickListener(function () {
            if (0 != b.length)
                for (var a = 0; a < b.length; a++) {
                    var c = b[a]._target;
                    void 0 != c.opacity && c.css({
                        opacity: c.opacity
                    })
                }
        })
    })();
    var c = function (a) {
        if (a.cashLog.length) {
            var c = $("#cashLogContainer"),
                d = [];
            a.fansChange && d.push({
                amount: a.fansChange,
                label: "fans".localize()
            });
            d.addRange(a.cashLog);
            for (var f = 0; f < d.length; f++) {
                var n = d[f],
                    r = $('<div class="cashLogItem"><div class="cashLogAmount"></div><div class="cashLogLabel"></div></div>');
                r.find(".cashLogAmount").text(UI.getShortNumberString(Math.floor(n.amount))).addClass(0 > n.amount ? "red" : "green");
                r.find(".cashLogLabel").text(n.label);
                r.opacity = 0.5;
                n = createjs.Tween.get(r).to({
                    opacity: 1
                }, 200).wait(1500).to({
                    opacity: 0
                }, 400).call(function (a) {
                    b.remove(a);
                    this.remove()
                });
                c.prepend(r);
                b.push(n)
            }
            5E3 < Math.abs(a.cashLog.sum(function (a) {
                return a.amount
            })) && Sound.playSoundOnce("cash", 0.2);
            a.cashLog.length = 0;
            a.fansChange && (a.fans += a.fansChange, a.fansChange = 0)
        }
    },
        f, d
})();
(function () {
    var a = ["./images/superb/conf1f.png", "./images/superb/conf2f.png", "./images/superb/conf3f.png"],
        b = "./images/superb/conff1r.png ./images/superb/conff2r.png ./images/superb/conff3r.png ./images/superb/conff4r.png ./images/superb/confm1r.png ./images/superb/confm2r.png ./images/superb/confm3r.png ./images/superb/confm4r.png".split(" "),
        c = "./images/superb/conff1l.png ./images/superb/conff2l.png ./images/superb/conff3l.png ./images/superb/conff4l.png ./images/superb/confm1l.png ./images/superb/confm2l.png ./images/superb/confm3l.png ./images/superb/confm4l.png".split(" ");
    UI.showConferenceBoothList = function (a, b) {
        var c = GameManager.company.booths;
        GameManager.company.conferenceStandFactor = null;
        $(".selectionOverlayContainer").hide();
        var d = $("#conferenceBoothPicker"),
            f = {
                disableCheckForNotifications: !0,
                close: !0,
                onClose: function () {
                    GameManager.removeFromActiveNotifications(a);
                    GameManager.resume(!0);
                    b && b()
                }
            };
        d.find(".conferenceBoothPickerText").text("The big game convention will take place in four weeks time. Do you want to participate?".localize());
        var g = d.find(".conferenceBoothSliderContainer");
        g.empty();
        var k = $('<div class="conferenceBoothVariationContainer royalSlider rsDefaultInv"></div>');
        g.append(k);
        for (var g = $("#genericBoothTemplate"), l = 0; l < c.length; l++) {
            var m = c[l];
            if ("" !== m.description) {
                var p = g.clone();
                p.find(".boothTitle").text(m.name);
                p.find(".boothDescription").text(m.description);
                p.find(".boothCashCost").text("Costs: {0}".localize().format(UI.getShortNumberString(m.cost)));
                k.append(p)
            }
        }
        PlatformShim.ISWIN8 ? k.gdSlider() : f.onOpen = function () {
            k.gdSlider()
        };
        d.find(".okButton").clickExcl(function () {
            Sound.click();
            var a = d.find(".rsActiveSlide").find(".boothTitle").text(),
                b = GameManager.company.booths.first(function (b) {
                    return b.name == a
                });
            GameManager.company.cash >= b.cost ? (GameManager.company.conferenceStandFactor = b.standFactor, GameManager.company.adjustCash(-b.cost, b.name), UI.closeModal()) : d.find(".centeredButtonWrapper").effect("shake", {
                times: 2,
                distance: 5
            }, 50)
        });
        UI.showModalContent("#conferenceBoothPicker", f)
    };
    var f = function (a, b) {
        var c = "",
            c = GameManager.company.currentGame ? b ? GameManager.company.gameLog.last().title :
                GameManager.company.currentGame.title : b ? GameManager.company.gameLog[GameManager.company.gameLog.length - 2].title : GameManager.company.gameLog.last().title,
            d = 150,
            f = 50,
            g = 378,
            l = 369;
        2 === a ? b ? (d = 90, f = 25, g = 385, l = 392) : (d = 140, f = 15, g = 387, l = 274) : 3 === a ? (d = 245, f = 33, g = 372, l = 234) : 4 === a && (b ? (d = 176, f = 40, g = 379, l = 304) : (d = 150, f = 15, g = 378, l = 252));
        return k(c, d, f, g, l)
    },
        d = function (a, b) {
            var c = GameManager.company.name,
                d = 180,
                f = 30,
                g = 381,
                l = 256;
            2 === a ? (d = 255, f = 35, g = 382, l = 237) : 3 === a ? (d = 300, f = 35, g = 373, l = 180, b && (d = 127, f = 15, g = 376, l = 331)) :
                4 === a && (d = 290, f = 29, g = 378, l = 348);
            return k(c, d, f, g, l)
        },
        k = function (a, b, c, d, f) {
            var g = new createjs.Container;
            g.x = d;
            g.y = f;
            d = UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" : "Open Sans";
            f = 32;
            do {
                var k = "bold {0}pt {1}".format(f, d),
                    k = new createjs.Text(a, k, "black");
                f -= 1
            } while ((k.getMeasuredWidth() > b || k.getMeasuredLineHeight() > c) && 1 < f);
            b = f / 32;
            c = createjs.Graphics.getHSL(0, 0, 24);
            k = new createjs.Text(a, "bold 32pt {0}".format(d), c);
            k.textAlign = "center";
            k.textBaseline = "middle";
            g.scaleX = b;
            g.scaleY = b;
            g.addChild(k);
            return g
        },
        m = function (a,
            b) {
            var c = "",
                d = !1;
            GameManager.currentHwProject && GameManager.currentHwProject.announced ? (c = GameManager.currentHwProject.iconUri, d = !0) : (c = GameManager.company.licencedPlatforms.last(function (a) {
                return a.isCustom
            })) ? (c = c.iconUri, d = !0) : c = GameManager.company.currentGame ? Platforms.getPlatformImage(GameManager.company.currentGame.platforms[0], GameManager.company.currentWeek) : Platforms.getPlatformImage(GameManager.company.gameLog.last().platforms[0], GameManager.company.currentWeek);
            if (b && !d)
                for (d = GameManager.company.gameLog.length -
                    1; 0 < d; d--) {
                    var f = Platforms.getPlatformImage(GameManager.company.gameLog[d].platforms[0], GameManager.company.currentWeek);
                    if (f != c) {
                        c = f;
                        break
                    }
                }
            c = new createjs.Bitmap(c);
            d = new createjs.Container;
            d.scaleX = 0.2;
            d.scaleY = 0.2;
            3 === a ? (d.x = 356, d.y = 350) : 2 === a ? (d.y = 315, d.x = b ? 265 : 460) : 4 === a && (d.scaleX = 0.08, d.scaleY = 0.08, d.y = 300, d.x = b ? 236 : 509);
            d.addChild(c);
            return d
        };
    UI._showGameConferenceAnimation = function (a, b) {
        var c = $("#gameConferenceAnimationDialog"),
            g = GameManager.company.booths.first(function (a) {
                return a.standFactor ==
                    GameManager.company.conferenceStandFactor
            });
        c.find(".windowTitle").text(4 != g.id ? "Game Convention: G3".localize("heading") : "{0} Convention".localize("heading").format(GameManager.company.name));
        if (g) {
            c.find(".conventionImageFloor").attr("src", g.floorImage);
            c.find(".conventionImageBg").attr("src", g.bgImage);
            var k = c.find(".conventionImageFg");
            g.fgImage ? (k.show(), k.attr("src", g.fgImage)) : k.hide()
        }
        c.find(".okButton").unbind("click").click(UI.closeConferenceAnimationDialog).hide();
        var l = this;
        UI.showModalContent("#gameConferenceAnimationDialog", {
            disableCheckForNotifications: !0,
            onOpen: function () {
                var b = c.find("#animationLayer");
                b.empty();
                l.stage = new createjs.Stage(b[0]);
                l.stage.canvas.height = l.stage.canvas.clientHeight;
                l.stage.canvas.width = l.stage.canvas.clientWidth;
                l.flippingBox = new FlippingCounter.FlippingBox(8, 6);
                l.flippingBox.init();
                l.flippingBox.fill("00000000");
                l.flippingBox.container.x = 41;
                l.flippingBox.container.y = 41;
                b = new createjs.Container;
                b.addChild(FlippingCounter.panel);
                b.addChild(l.flippingBox.container);
                b.x = 190;
                b.scaleX = 0.4;
                b.scaleY = 0.4;
                l.stage.addChild(b);
                l.stage.addChild(d(g.id));
                l.stage.addChild(f(g.id));
                if (3 === g.id) l.stage.addChild(d(g.id, !0)), l.stage.addChild(m(g.id));
                else if (2 === g.id || 4 === g.id) l.stage.addChild(f(g.id, !0)), l.stage.addChild(m(g.id)), l.stage.addChild(m(g.id, !0));
                UI._startGameConferenceAnimations(a.buttonText, g.id)
            },
            onClose: function () {
                GameManager.removeFromActiveNotifications(a);
                var c = a.buttonText,
                    d = c / 1E6 * 0.1 + 1,
                    f = GameManager.company;
                f.currentGame && (f.currentGame.hypePoints += Math.min(200, Math.floor(c /
                    1E6 * 200)));
                for (var g = Sales.getGamesToSell(f), k = 0; k < g.length; k++) void 0 === g[k].confAmount ? g[k].totalSalesCash *= d : 0 < g[k].confAmount && (g[k].totalSalesCash += g[k].confAmount * (d - 1)), g[k].confAmount = 0;
                g = Sales.getConsolesToSell(f);
                for (k = 0; k < g.length; k++) g[k].unitsSold += 1.5 / Sales.consoleUnitPrice * (c / 1E6);
                d = Math.floor(f.fans * (d - Math.floor(d)) / 10);
                0 < d && f.adjustFans(d);
                f.conferenceHype = Math.min(200, Math.floor(c / 1E6 * 200));
                b && b()
            },
            close: !1
        })
    };
    UI.closeConferenceAnimationDialog = function () {
        UI.closeModal()
    };
    var l = [],
        g = 0.9;
    GameManager.addTickListener(function (a) {
        if (l && 0 < l.length) {
            a *= g;
            for (var b = 0; b < l.length; b++) l[b].tick(a, !1);
            UI.stage.update()
        }
    });
    var n = function () {
        g = 1.4
    },
        r = [],
        p = [],
        s = [];
    UI._startGameConferenceAnimations = function (d, f) {
        if (0 === r.length) {
            for (var k = 0; k < a.length; k++) r.push(new createjs.Bitmap(a[k]));
            for (k = 0; k < c.length; k++) s.push(new createjs.Bitmap(c[k]));
            for (k = 0; k < b.length; k++) p.push(new createjs.Bitmap(b[k]))
        }
        var m = $(".simplemodal-data"),
            z = m.find(".animationLayer");
        l = [];
        FlippingCounter._activeUITweens =
            l;
        g = 0.9;
        $(window).on("click", n);
        var B = 1200;
        l.push(createjs.Tween.get(z).wait(0).call(function () {
            UI.flippingBox.fill(0)
        }));
        l.push(createjs.Tween.get(z).wait(B).call(function () {
            UI.flippingBox.fill(Math.round(d / 20))
        }));
        l.push(createjs.Tween.get(z).wait(2 * B).call(function () {
            UI.flippingBox.fill(Math.round(d / 15))
        }));
        l.push(createjs.Tween.get(z).wait(3 * B).call(function () {
            UI.flippingBox.fill(Math.round(d / 10))
        }));
        l.push(createjs.Tween.get(z).wait(4 * B).call(function () {
            UI.flippingBox.fill(Math.round(d / 9))
        }));
        l.push(createjs.Tween.get(z).wait(5 * B).call(function () {
            UI.flippingBox.fill(Math.round(d / 6))
        }));
        l.push(createjs.Tween.get(z).wait(6 * B).call(function () {
            UI.flippingBox.fill(Math.round(d / 4))
        }));
        l.push(createjs.Tween.get(z).wait(7 * B).call(function () {
            UI.flippingBox.fill(Math.round(d / 2.2))
        }));
        l.push(createjs.Tween.get(z).wait(8 * B).call(function () {
            UI.flippingBox.fill(Math.round(d / 1.8))
        }));
        l.push(createjs.Tween.get(z).wait(9 * B).call(function () {
            UI.flippingBox.fill(Math.round(d / 1.2))
        }));
        l.push(createjs.Tween.get(z).wait(10 *
            B).call(function () {
                UI.flippingBox.fill(d)
            }));
        var D = UI.stage.canvas.width,
            E = UI.stage.canvas.height,
            w = 5E3,
            F = 6E4 * B / d;
        3 === f ? (w /= 2, F /= 2) : 4 === f && (w /= 2.5, F /= 2.5);
        B = F;
        for (k = 0; k <= d; k += w) {
            var B = B + F,
                C = u(D, E, f);
            UI.stage.addChild(C);
            l.push(createjs.Tween.get(C).wait(B).to({
                alpha: 0.15
            }, 500))
        }
        k = createjs.Tween.get(z).wait(B).call(function () {
            m.find(".okButton").slideDown("fast");
            $(window).off("click", n);
            l = [];
            FlippingCounter._activeUITweens = l;
            g = 0.9
        });
        l.push(k)
    };
    var u = function (a, b, c) {
        var d, f, g, k, l;
        1 === c ? (l = 1, d = 130 +
            Math.random() * (a - 260 - 62 * l), f = 35 * Math.random() + 415 - 176 * l, g = 283, k = 474) : 2 === c ? (l = 0.625, d = 100 + Math.random() * (a - 200 - 62 * l), f = 30 * Math.random() + 420 - 176 * l, g = 233, k = 531) : 3 === c ? (l = 0.075, f = Math.random(), d = 113 + f * (a - 205 - 62 * l), l *= 4 * Math.abs(0.46 - f) + 1, f = 412 - 176 * l, g = 338, k = 413) : 4 === c && (l = 0.15, f = Math.random(), l *= 4 * Math.abs(0 - f) + 1, d = Math.random() * (a - 62 * l), f = 85 * f + 365 - 176 * l, g = 283, k = 476);
        a = void 0;
        a = 3 > c && d < g || 4 === c && d < g || 3 === c && d > k ? s.pickRandom().clone() : 3 > c && d > k || 4 === c && d > k || 3 === c && d > g ? p.pickRandom().clone() : r.pickRandom().clone();
        a.alpha = 0;
        a.x = d;
        a.y = f;
        a.scaleX = l;
        a.scaleY = l;
        return a
    }
})();
(function () {
    var a;
    UI.showDevelopConsoleMenu = function (d, f) {
        $(".selectionOverlayContainer").hide();
        var n = $("#createConsoleMenu");
        n.find(".consoleName")[0].value = "Console Name".localize();
        var r = {
            disableCheckForNotifications: !0,
            close: !0,
            onClose: function () {
                m();
                GameManager.removeFromActiveNotifications(d);
                GameManager.resume(!0);
                f && f()
            }
        };
        n.find(".dialogNextButton").clickExcl(function () {
            $("#createConsoleMenu").find(".dialogNextButton").effect("shake", {
                times: 2,
                distance: 5
            }, 50)
        });
        n.find(".dialogBackButton").clickExcl(function () {
            Sound.click();
            m();
            $("#createConsoleMenu").find(".dialogScreen1").transition({
                "margin-left": 0
            });
            $("#createConsoleMenu").find(".dialogScreen2").transition({
                "margin-left": "100%"
            })
        });
        var p = n.find(".consoleQASlider");
        p.empty();
        var s = $('<div class="budgetSlider"></div>').slider({
            orientation: "horizontal",
            range: "min",
            min: 0,
            max: 100,
            value: 0,
            animate: "fast",
            slide: function (a, b) {
                var c = $(b.handle).closest(".budgetSlider");
                if (!c.hasClass("budgetSlider")) throw "couldn't find target slider";
                c.slider("value", b.value);
                k()
            }
        });
        p.append(s);
        p = n.find(".consoleSliderContainer");
        p.empty();
        s = $('<div class="consoleVariationContainer royalSlider rsDefaultInv"></div>');
        p.append(s);
        for (var u = GameManager.company.licencedPlatforms.count(function (a) {
            return a.isCustom
        }) + 1, p = b(), t = 0; t < p.length; t++) {
            var q = $("<div><img src='images/platforms/superb/{0}' style='width:200px;'/><div class='sliderTabCaption rsTmb'>".format(p[t]) + PlatformShim.toStaticHtml("Variation {0}".localize().format(t + 1)) + "</div></div>");
            s.append(q)
        }
        PlatformShim.ISWIN8 && s.gdSlider();
        r.onOpen = function () {
            PlatformShim.ISWIN8 || s.gdSlider();
            UI.maxFont(n.find("bolder", ".dialogScreen1Title"), 34);
            UI.maxFont(n.find("bolder", ".dialogScreen2Title"), 34);
            UI.maxFont(n.find(void 0, ".windowMainActionButton"), 34);
            c();
            k()
        };
        var v = n.find(".okButton");
        v.clickExcl(function () {
            var b = k();
            Sound.click();
            if (b > GameManager.company.cash) v.parent().effect("shake", {
                times: 2,
                distance: 5
            }, 50), $(".simplemodal-data").find(".windowCostLabel").effect("pulsate", {
                times: 2
            });
            else {
                v.off("click");
                var c = n.find(".consoleName")[0].value,
                    d = n.find(".rsActiveSlide img").attr("src"),
                    f = a.filter(function (a) {
                        return void 0 != a.techLevel
                    }).average(function (a) {
                        return a.techLevel
                    }),
                    g = Math.floor(500 * f),
                    l = n.find(".budgetSlider").slider("value") / 100,
                    d = {
                        id: "custom console",
                        pointsCost: g,
                        name: c,
                        iconUri: d,
                        targetZone: 0,
                        techLevel: f,
                        version: u,
                        variation: parseInt(d.slice(38, 39)),
                        qF: l,
                        features: a.map(function (a) {
                            return a.id
                        })
                    };
                GameManager.company.adjustCash(-b, "{0} costs".localize().format(c));
                GameManager.startProject(d);
                UI.closeModal()
            }
        });
        UI.showModalContent("#createConsoleMenu",
            r)
    };
    var b = function () {
        for (var a = [], c = 1; 5 > c && (GameManager.company.flags["console" + c + "Used"] || (a = 4 === c ? a.concat(["CustomPlatform" + c + "V1.png", "CustomPlatform" + c + "V2.png"]) : a.concat(["CustomPlatform" + c + "V1.png", "CustomPlatform" + c + "V2.png", "CustomPlatform" + c + "V3.png"]), 6 !== a.length)); c++);
        if (0 === a.length) {
            for (c = 1; 5 > c; c++) GameManager.company.flags["console" + c + "Used"] = void 0;
            return b()
        }
        return a
    },
        c = function () {
            var a = $(".simplemodal-data").find(".dialogNextButton");
            a.clickExcl(function () {
                Sound.click();
                PlatformShim.execUnsafeLocalFunction(function () {
                    f();
                    k()
                });
                $("#createConsoleMenu").find(".dialogScreen1").transition({
                    "margin-left": "-200%"
                });
                $("#createConsoleMenu").find(".dialogScreen2").transition({
                    "margin-left": 0
                })
            });
            a.removeClass("baseButton").addClass("selectorButton").addClass("orangeButton")
        },
        f = function () {
            var b = $(".simplemodal-data").find(".featureSelectionContainer"),
                c = General.getAvailableFeaturesForConsole().groupBy(function (a) {
                    return a.category
                }),
                d = c.filter(function (a) {
                    return "Graphic" === a.category
                }),
                c = d.concat(c.except(d));
            b.empty();
            a = [];
            for (var d = null, f = [], m = function (c, d) {
                if (c.hasClass("selectedFeature")) {
                    if ("graphic-type" === d.group) return;
                    c.removeClass("selectedFeature");
                    a.remove(d)
                } else {
                    if (d.group) {
                        var g = ".radioButton" + f.indexOf(d.group);
                        b.find(g).removeClass("selectedFeature");
                        for (var g = a.filter(function (a) {
                            return a.group === d.group
                        }), m = 0; m < g.length; m++) a.remove(g[m])
                    }
                    c.addClass("selectedFeature");
                    a.push(d);
                    UI._updateGameDefinitionCost()
                }
                k()
            }, s = 0; s < c.length; s++) {
                var u = c[s];
                u.category != d && (b.append($('<div class="featureSelectionCategoryHeading">{0}</div>'.format(u.categoryDisplayName ?
                    u.categoryDisplayName : u.category))), d = u.category);
                var t = UI.generateFeatureElement(u);
                t.find(".featureContent").text("{0} ({1})".format(u.name, UI.getShortNumberString(100 * Research.getEngineCost(u))));
                if (u.group) {
                    -1 == f.indexOf(u.group) && f.push(u.group);
                    var q = "radioButton" + f.indexOf(u.group);
                    t.addClass(q)
                } (function (a, b) {
                    a.clickExcl(function () {
                        m(a, b)
                    })
                })(t, u);
                b.append(t);
                GameManager.uiSettings.selectedConsoleFeatures && -1 != GameManager.uiSettings.selectedConsoleFeatures.indexOf(u.id) ? m(t, u) : a.some(function (a) {
                    return "Graphic" ===
                        a.category
                }) || m(t, u)
            }
            UI.createDraggable(b);
            k()
        },
        d = function () {
            return a && 0 != a.length ? a.sum(function (a) {
                return 100 * Research.getEngineCost(a)
            }) : 0
        },
        k = function () {
            var a = $(".simplemodal-data"),
                b;
            b = 1E7 + d();
            var c, f = a.find(".budgetSlider").slider("value") / 100;
            c = (f /= 1) * f;
            f *= c;
            c = Math.floor(1 + 19 * (0 + 1 * (-0.5 * f * c + 3 * c * c + -3.5 * f + 2 * c)));
            c *= 1E6;
            b += c;
            a = a.find(".windowCostLabel");
            UI.maxFont(void 0, a, 20, "Cost: {0}".localize().format(UI.getShortNumberString(b)));
            return b
        },
        m = function () {
            a && (GameManager.uiSettings.selectedConsoleFeatures =
                a.map(function (a) {
                    return a.id
                }))
        };
    UI.createConsoleClick = function () {
        Sound.click()
    }
})();
(function () {
    var a = [];
    UI.addMaintenanceCard = function (d) {
        if (1 <= d.maintenanceLog.length)
            if (1 === d.maintenanceLog.length) {
                var g = c(d),
                    k = f(!0);
                g.stage.addChild(k);
                k.x = 60;
                k.y = 105;
                k.width = 115;
                k.scaleY = 0;
                var u = d.maintenanceLog[0] / 99 * 70;
                n.push(createjs.Tween.get(k).to({
                    y: 105 - u,
                    scaleY: u / 70
                }, 300));
                g.shapes = [k];
                k = f(!1);
                g.stage.addChild(k);
                k.x = 60;
                k.y = 105;
                k.scaleY = 0;
                k.width = 115;
                g.repairShapes = [k];
                k = b();
                u = b();
                g.lines = [k, u];
                m(g);
                g.stage.addChild(k);
                g.stage.addChild(u);
                k = new ProgressBarVisual;
                k.alpha = 1;
                k.progress = 0.5;
                k.width = 20;
                k.height = 65;
                k.x = 10;
                k.y = 33;
                k.isHorizontal = !1;
                g.stage.addChild(k);
                g.progressBar = k;
                a.push(g);
                d.repairPointsLog || (d.repairPointsLog = [0])
            } else l(d)
    };
    var b = function () {
        var a = new createjs.Shape;
        a.alpha = 1;
        a.x = 60;
        var b = a.graphics;
        b.beginFill(createjs.Graphics.getRGB(45, 45, 45, 1));
        b.drawRect(0, 0, 115, 0.5);
        b.closePath();
        return a
    },
        c = function (a) {
            var b = $("#consoleMaintenanceContainer"),
                c = $("#consoleMainCardTemplate").clone();
            c.clickExcl(function () {
                VisualsManager.scrollToZone(0, !0)
            });
            c.removeAttr("id");
            c.title = c.find(".title");
            c.points = c.find(".points");
            d(c, a.name);
            k(c, a.maintenancePoints);
            b.append(c);
            b = c.find(".consoleMainCardGroupCanvas");
            b = new createjs.Stage(b[0]);
            b.canvas.height = 105;
            b.canvas.width = 180;
            return {
                id: a.id,
                stage: b,
                card: c,
                console: a
            }
        },
        f = function (a) {
            var b = new createjs.Shape;
            b.alpha = 1;
            b.x = 60;
            var c = b.graphics;
            a ? c.beginFill(createjs.Graphics.getRGB(255, 0, 0, 1)) : c.beginFill(createjs.Graphics.getRGB(86, 216, 86, 1));
            c.drawRect(0, 0, 115, 70);
            c.closePath();
            return b
        },
        d = function (a, b, c) {
            c = UI.getMeasuredWidth(b,
                14);
            c = Math.min(180 / c * 14, 14);
            a.title.css("font-size", c + "pt");
            a.title.text(b)
        },
        k = function (a, b) {
            a.points.text("Backlog: {0}".localize().format(b))
        },
        m = function (a) {
            a.stage.removeChild(a.lines[0]);
            a.stage.removeChild(a.lines[1]);
            var b = Math.max(99, a.console.maintenanceLog.max(function (a) {
                return a
            }));
            a.lines[0].y = 105 - 66 / b * 70;
            a.lines[1].y = 105 - 99 / b * 70;
            a.stage.addChild(a.lines[0]);
            a.stage.addChild(a.lines[1])
        },
        l = function (d) {
            var g = c(d),
                k = new ProgressBarVisual;
            k.alpha = 1;
            k.progress = d.satisFaction.clamp(0, 1);
            k.color =
                createjs.Graphics.getHSL(80 * d.satisFaction.clamp(0, 1), 100, 50);
            k.width = 20;
            k.height = 65;
            k.x = 10;
            k.y = 33;
            k.isHorizontal = !1;
            g.stage.addChild(k);
            g.progressBar = k;
            var l = Math.max(99, d.maintenanceLog.max(function (a) {
                return a
            })),
                n = d.maintenanceLog.length,
                k = [];
            g.maintenanceShapes = [];
            g.repairShapes = [];
            for (var q = 0; q < n; q++) {
                var v = f(!0);
                v.scaleX = 1 / n;
                v.x = 60 + 115 / n * q;
                var A = d.maintenanceLog[q] / l * 70;
                v.y = 105 - A;
                v.scaleY = A / 70;
                k.push(v);
                var z = f(!1);
                z.scaleX = 1 / n;
                z.x = 60 + 115 / n * q;
                A = d.repairPointsLog[q] / l * 70;
                z.y = 105 - A;
                z.scaleY =
                    A / 70;
                g.repairShapes.push(z);
                g.stage.addChild(v);
                g.stage.addChild(z)
            }
            d = b();
            l = b();
            g.lines = [d, l];
            m(g);
            g.stage.update();
            g.shapes = k;
            a.push(g)
        };
    UI.updateMaintenanceCard = function (b) {
        var c = a.first(function (a) {
            return a.id === b.id
        });
        c || (UI.addMaintenanceCard(b), c = a.first(function (a) {
            return a.id === b.id
        }));
        k(c.card, b.maintenancePoints);
        if (c && c.shapes.length < b.maintenanceLog.length) {
            var d = c.stage,
                g, l = Math.max(99, b.maintenanceLog.max(function (a) {
                    return a
                })),
                q = b.maintenanceLog.length,
                v = 115 / q;
            30 <= b.maintenanceLog.length &&
                (c.stage.removeChild(c.shapes[0]), c.shapes.remove(c.shapes[0]), b.maintenanceLog.splice(0, 1), c.stage.removeChild(c.repairShapes[0]), c.repairShapes.remove(c.repairShapes[0]), b.repairPointsLog.splice(0, 1), q--);
            b.repairPointsLog.length < b.maintenanceLog.length && (b.repairPointsLog.push(0), b.repairPoints = 0, g = f(!1), g.y = 105, g.x = 175 - v, g.scaleX = 1 / q, g.scaleY = 0, c.repairShapes.push(g));
            for (var A = c.shapes.length, z = 0; z < A; z++) {
                var B = b.maintenanceLog[z] / l * 70,
                    D = 1 / q;
                n.push(createjs.Tween.get(c.shapes[z]).to({
                    scaleX: D,
                    x: 60 + 115 / q * z,
                    y: 105 - B,
                    scaleY: B / 70
                }, 500))
            }
            A = f(!0);
            A.y = 105;
            A.x = 175 - v;
            A.scaleX = 1 / q;
            A.scaleY = 0;
            c.shapes.push(A);
            B = 70 * (b.maintenanceLog.last() / l);
            n.push(createjs.Tween.get(A).wait(500).to({
                y: 105 - B,
                scaleY: B / 70
            }, 300));
            for (z = 0; z < c.repairShapes.length; z++) B = b.repairPointsLog[z] / l * 70, D = 1 / q, n.push(createjs.Tween.get(c.repairShapes[z]).to({
                scaleX: D,
                x: 60 + 115 / q * z,
                y: 105 - B,
                scaleY: B / 70
            }, 500));
            d.addChild(A);
            g && d.addChild(g);
            m(c)
        }
    };
    UI.updateRepairPoints = function (b) {
        var c = a.first(function (a) {
            return a.id === b.id
        });
        if (c) {
            var d =
                Math.max(99, b.maintenanceLog.max(function (a) {
                    return a
                }));
            b.repairPointsLog[b.repairPointsLog.length - 1] = b.repairPoints;
            var d = 70 * (b.repairPointsLog.last() / d),
                f = c.repairShapes.last();
            f.y = 105 - d;
            f.scaleY = d / 70;
            k(c.card, b.maintenancePoints)
        }
    };
    UI.clearMaintenanceCards = function () {
        a.forEach(function (a) {
            UI.removeMaintenanceCard(a.id, !1)
        });
        $("#consoleMaintenanceContainer").empty();
        a = []
    };
    UI.removeMaintenanceCard = function (b, c) {
        var d = a.first(function (a) {
            return a.id === b.id
        });
        d && (d.card.remove(), a.remove(d))
    };
    var g =
        function (b, c) {
            var d = a.first(function (a) {
                return a.id === b.id
            });
            b.satisFaction || (b.satisFaction = 1);
            33 > b.maintenancePoints ? b.satisFaction += 0.04 * c / 500 : 66 > b.maintenancePoints ? b.satisFaction += 0.02 * c / 500 : 99 < b.maintenancePoints ? b.satisFaction -= 0.02 * c / 350 : 122 < b.maintenancePoints && (b.satisFaction -= 0.04 * c / 350);
            b.satisFaction = b.satisFaction.clamp(-0.3, 1.3);
            d.progressBar.progress = b.satisFaction.clamp(0, 1);
            d.progressBar.color = createjs.Graphics.getHSL(80 * b.satisFaction.clamp(0, 1), 100, 50)
        },
        n = [];
    GameManager.addTickListener(function (b,
        c) {
        if (!c && n && 0 < n.length && !c) {
            for (var d = 0; d < n.length; d++) n[d].tick(b, !1);
            for (d = 0; d < a.length; d++) g(a[d].console, b), a[d].stage.update()
        }
    }, !0)
})();
(function () {
    UI._isModalContentOpen = !1;
    UI.isModalContentOpen = function () {
        return b.some(function (a) {
            return !0 === a.dialog("isOpen")
        }) || UI._isModalContentOpen || !0 === $("#newGameView").dialog("isOpen") || !0 === $("#createShareCodeWindow").dialog("isOpen") || !0 === $("#loadView").dialog("isOpen") || !0 === $("#saveView").dialog("isOpen") || !0 === $("#overwriteGameDialog").dialog("isOpen") || !0 === $("#useKnowledgeFromPreviousGameDialog").dialog("isOpen") || !0 === $("#gameHistoryDialog").dialog("isOpen") || !0 === $("#platformReleaseNewsContent").dialog("isOpen")
    };
    UI.realignOpenDialogs = function () {
        var a = $(document).find(".ui-dialog"),
            b = $(document.body);
        0 < a.length && a.position({
            of: b,
            my: "center center",
            at: "center center",
            offset: "0 0"
        })
    };
    UI._supressModalAnimations = !1;
    UI.showModalContent = function (a, b) {
        b || (b = {});
        if (b.disableCheckForNotifications || "#notificationContent" == a) {
            GameManager.pause(!0);
            var d = !0 === b.close;
            $(a).modal({
                close: d,
                onOpen: function (a) {
                    b.sound ? Sound.playSoundOnce(b.sound, b.volume) : UI._supressModalAnimations || Sound.playSoundOnce("popupOpen", 0.35);
                    if (d) {
                        var c =
                            $(UI.closeButtonTemplate);
                        c.css("z-index", 5E3);
                        c.clickExcl(function () {
                            Sound.click();
                            var a = $(".simplemodal-data").find(".selectionOverlayContainer");
                            0 < a.length && a.is(":visible") ? a.fadeOut("fast") : UI.closeModal()
                        });
                        $(".simplemodal-container").append(c);
                        GDT.fire(a, GDT.eventKeys.ui.dialogOpen)
                    }
                    UI._isModalContentOpen = !0;
                    UI._supressModalAnimations || a.container.addClass("windowStyleStartState");
                    a.overlay.show();
                    a.container.show();
                    a.data.show();
                    a.overlay.transit({
                        opacity: 0.2
                    }, UI._supressModalAnimations ? 0 :
                        200);
                    a.container.removeClass("windowStyleStartState");
                    a.container.addClass("windowStyleShowState");
                    $(".simplemodal-data").find(".windowTitle:first:visible");
                    UI.maxFont("bolder", $(".simplemodal-data").find(".windowTitle:first:visible"), 34);
                    if (b && b.onOpen) b.onOpen()
                },
                onClose: function (a) {
                    a.container.removeClass("windowStyleShowState");
                    UI._supressModalAnimations || (a.container.addClass("windowStyleHideState"), a.overlay.transit({
                        opacity: 0
                    }, 100));
                    var c = function () {
                        UI.closeModal();
                        a.container.removeClass("windowStyleHideState");
                        UI._isModalContentOpen = !1;
                        if (b && b.onClose) b.onClose();
                        UI.currentCloseCallback && (UI.currentCloseCallback(), UI.currentCloseCallback = null);
                        GameManager.resume(!0)
                    };
                    UI._supressModalAnimations ? c() : setTimeout(c, 100);
                    GDT.fire(a, GDT.eventKeys.ui.dialogClose)
                },
                escClose: d,
                zIndex: 4500
            })
        } else GameManager.showPendingNotifications(function () {
            PlatformShim.execUnsafeLocalFunction(function () {
                b.disableCheckForNotifications = !0;
                UI.showModalContent(a, b)
            })
        })
    };
    UI.currentCloseCallback = null;
    UI.closeModal = function (a) {
        UI._supressModalAnimations =
            0 < GameManager.company.activeNotifications.length;
        if (null != UI.currentCloseCallback && a) throw "attempting to override existing callback";
        a && (UI.currentCloseCallback = a);
        PlatformShim.execUnsafeLocalFunction(function () {
            $.modal.close()
        })
    };
    var a = !1;
    UI.closeAllDialogs = function () {
        $("#newGameView").dialog("close");
        $("#loadView").dialog("close");
        $("#saveView").dialog("close");
        $("#createShareCodeWindow").dialog("close");
        $("#overwriteGameDialog").dialog("close");
        $("#gameHistoryDialog").dialog("close");
        $("#platformReleaseNewsContent").dialog("close");
        $("#purchasePlatformDialog").dialog("close");
        $("#useKnowledgeFromPreviousGameDialog").dialog("close");
        $(document).find("#gamePausedOverlay").hide();
        UI.enableMainMenu();
        for (var c = 0; c < b.length; c++) a = !0, b[c].dialog("close");
        a = !1;
        $.modal.impl.o && ($.modal.impl.o.onClose = null);
        PlatformShim.execUnsafeLocalFunction(function () {
            $.modal.close()
        });
        UI._isModalContentOpen = !1;
        UI.closeContextMenu()
    };
    (function (a) {
        var b = a.noop;
        a.browser.msie && (b = function (b) {
            b = a(b).parent(".ui-dialog");
            var d = b.innerWidth();
            d && b.css("width",
                d)
        });
        var d = a.ui.dialog.prototype._init;
        a.ui.dialog.prototype._init = function () {
            if ("auto" == this.options.width) {
                var k = this.options.open;
                this.options.open = function () {
                    b(this);
                    k && k.apply(this)
                }
            }
            a.browser.msie && "drop" == this.options.hide && (this.options.hide = "fold");
            return d.apply(this)
        }
    })(jQuery);
    var b = [];
    $.fn.gdDialog = function (c) {
        c || (c = {});
        void 0 == c.zIndex && (c.zIndex = 5E3);
        var f, d, k;
        this.hasClass("tallWindow") ? (f = 600, d = 650, k = "tallWindow") : this.hasClass("smallWindow") ? (f = 500, d = 350, k = "smallWindow") : this.hasClass("wideWindow") &&
            (f = 800, d = 650, k = "wideWindow");
        this.hasClass("windowBorder") && (k += " windowBorder");
        var m = this;
        b.push(m);
        m.dialog({
            close: !1,
            closeOnEscape: c.close,
            draggable: !1,
            width: f ? f : "auto",
            height: d ? d : "auto",
            modal: !0,
            resizable: !1,
            show: "fade",
            zIndex: c.zIndex,
            open: function () {
                var a = $(this);
                if (c.close) {
                    var b = $(UI.closeButtonTemplate);
                    b.css("z-index", c.zIndex + 500);
                    b.clickExclOnce(function () {
                        Sound.click();
                        m.dialog("close")
                    });
                    a.parents(".ui-dialog:first").append(b)
                }
                c.popout && $("#gameContainerWrapper").addClass("popout-active");
                a.siblings(".ui-dialog-titlebar").remove();
                k && $(a).parents(".ui-dialog:first").addClass(k);
                a.parents(".ui-dialog:first").removeClass("ui-widget-content");
                if (c && c.onOpen) c.onOpen();
                c.disableOverlayFix || ($(".ui-widget-overlay:last").css("z-index", c.zIndex - 50), a.parents(".ui-dialog:first").css("z-index", c.zIndex));
                GDT.fire(a, GDT.eventKeys.ui.dialogOpen)
            },
            close: function () {
                c.popout && $("#gameContainerWrapper").removeClass("popout-active").addClass("popout-inactive");
                $(this).dialog("destroy");
                this.style.cssText =
                    "display:none;"; - 1 != b.indexOf(m) && b.remove(m);
                if (c.onClose && !a) c.onClose();
                GDT.fire($(this), GDT.eventKeys.ui.dialogClose)
            }
        })
    }
})();
(function () {
    UI.showNotifications = function (a) {
        var b = GameManager.company.activeNotifications;
        0 === b.length && a && a();
        b = b[0];
        UI._supressModalAnimations = !1;
        UI._showNotification(b, a)
    };
    UI._showNotification = function (a, b) {
        GameManager.pause(!0);
        GDT.fire(GameManager, GDT.eventKeys.ui.beforeShowingNotification, {
            notification: a
        });
        switch (a.header) {
            case "{Reviews}":
                GameManager.company.gameLog.last().reviewMessageDisplayed = !0;
                UI.showReviewWindow(a, b);
                break;
            case "{BoothPicker}":
                GameManager.showBoothList(a, b);
                break;
            case "{GameDefinition}":
                UI._showGameDefinition(a,
                    b);
                break;
            case "{FeatureList}":
                UI._showFeatureList(a, b);
                break;
            case "{MarketingList}":
                UI.showMarketingList(a, b);
                break;
            case "{ReleaseGame}":
                UI._showReleaseGame(a, b);
                break;
            case "{GameConferenceAnimation}":
                UI._showGameConferenceAnimation(a, b);
                break;
            case "{Research}":
                UI.showResearchMenu(a, b);
                break;
            case "{Training}":
                UI.showTrainingMenu(a, b);
                break;
            case "{CreateEngine}":
                UI.showCreateEngineMenu(a, b);
                break;
            case "{FindContractWork}":
                UI.showFindContractWorkMenu(a, b);
                break;
            case "{DevelopConsole}":
                UI.showDevelopConsoleMenu(a,
                    b);
                break;
            case "{TrialEnd}":
                UI.showTrialEnd(a, b);
                break;
            case "{GameEnd}":
                UI.showGameEnd(a, b);
                break;
            case "{PlatformReleaseNews}":
                UI.showPlatformReleaseNews(a, b);
                break;
            case "{enterCompanyName}":
                UI.showNewGameView(a, b);
                break;
            case "{HireStaff}":
                UI.showHireStaff(a, b);
                break;
            case "{SupportGreenheartGames}":
                UI.showSupportUsOptionsWindow(a, b);
                break;
            case "{PostMortemComplete}":
                UI.showPostMortemComplete(a, b);
                break;
            default:
                c(a, b)
        }
    };
    var a = function (a, b, c) {
        var m = 34;
        c = c ? "" : "bolder";
        var l = UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" :
            "Open Sans";
        do {
            var g = "{0} {1}pt {2}".format(c, m, l),
                g = new createjs.Text(b, g, "black");
            m--
        } while (390 < 1.1 * g.getMeasuredWidth() && 10 < m);
        a.css({
            font: "{0} {1}pt {2}".format(c, m, l)
        }).text(b)
    },
        b = function (a) {
            var b = "bold {0}pt {1}".format(22, UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" : "Open Sans");
            a = new createjs.Text(a, b, "black");
            return 1.1 * a.getMeasuredWidth()
        },
        c = function (c, d) {
            var k = $("#notificationContent");
            k.empty();
            var m = $("#notificationContentTemplate").clone();
            c.options ? 2 == c.options.length ? m.find(".smallWindow").removeClass("smallWindow").addClass("notificationTwoOptions") :
                m.find(".smallWindow").removeClass("smallWindow").addClass("notificationThreeOptions") : m.find(".notificationOption2").hide();
            var l = m.find(".windowTitle");
            a(l, c.header);
            (l = c.text) && (l = l.replace(/\n/g, "<br />"));
            c.image ? (m.find(".notificationImage").attr("src", c.image), m.find(".notificationImageContainer").show()) : m.find(".notificationImageContainer").hide();
            var g = m.find(".notificationButton").css({
                opacity: 0
            }).text(c.buttonText),
                n = [g[0]];
            if (c.options) {
                var r = 290,
                    p = b(c.options[0]),
                    p = Math.min(r / p * 22, 22);
                $(g[0]).css("font-size", p + "pt");
                $(g[0]).text(c.options[0]);
                p = b(c.options[1]);
                p = Math.min(r / p * 22, 22);
                $(g[1]).css("font-size", p + "pt");
                $(g[1]).text(c.options[1]);
                n.push(g[1]);
                2 < c.options.length && (p = b(c.options[2]), p = Math.min(r / p * 22, 22), $(g[2]).css("font-size", p + "pt"), $(g[2]).text(c.options[2]), n.push(g[2]));
                var s = $("#sidebar").width();
                $("#sidebar span").each(function () {
                    var a = $(this).width(),
                        a = s / a * 12;
                    $(this).css({
                        "font-size": a,
                        "line-height": a / 1.2 + "px"
                    })
                })
            } else r = 290, p = b(g[0].innerText), p = Math.min(r / p *
                22, 22), $(g[0]).css("font-size", p + "pt");
            var u = function (a) {
                Sound.click();
                GameManager.removeFromActiveNotifications(c);
                var b;
                c.sourceId && (b = $(a.srcElement).hasClass("notificationOption1") ? 0 : $(a.srcElement).hasClass("notificationOption2") ? 1 : 2);
                General.notificationShown(c, b);
                GameManager.company && (0 < GameManager.company.activeNotifications.length ? UI.closeModal(function () {
                    UI._showNotification(GameManager.company.activeNotifications[0], d)
                }) : d ? UI.closeModal(function () {
                    d && d()
                }) : UI.closeModal())
            };
            m.find(".notificationText").text(l).typewrite({
                delay: 20,
                extra_char: "",
                replace_br: !0,
                speedUpOnClick: !0,
                soundLoop: "notificationTyping",
                volume: 0.12,
                callback: function () {
                    $(n).transition({
                        opacity: 1
                    }, "fast").clickExclOnce(function (a) {
                        u(a)
                    })
                }
            });
            UI.IS_SEGOE_UI_INSTALLED || m.find(".notificationText").addClass("fallback");
            "{noButton}" === c.buttonText && g.hide();
            k.append(m);
            k = {};
            c.sound && $.extend(k, {
                sound: c.sound,
                volume: c.volume
            });
            UI.showModalContent("#notificationContent", k)
        };
    UI.showPlatformReleaseNews = function (a, b) {
        var c = $("#platformReleaseNewsContent");
        c.empty();
        var m = $("#platformReleaseNewsTemplate").clone();
        m.find(".windowTitle").text("News".localize("heading"));
        for (var l, g = 0; g < Platforms.allPlatforms.length; g++)
            if (Platforms.allPlatforms[g].id === a.text) {
                l = Platforms.allPlatforms[g];
                break
            } g = "Today the new game platform {0} by {1} has been released.".localize().format(l.name, l.company);
        m.find(".platformRelaseNewsImage").attr("src", Platforms.getPlatformImage(l, GameManager.company.currentWeek));
        var n = m.find(".platformReleaseOkButton").css({
            opacity: 0
        }).text(a.buttonText),
            r = function () {
                Sound.click();
                GameManager.removeFromActiveNotifications(a);
                0 < GameManager.company.activeNotifications.length ? UI.closeModal(function () {
                    UI._showNotification(GameManager.company.activeNotifications[0], b)
                }) : UI.closeModal(function () {
                    b && b()
                })
            };
        m.find(".notificationText").text(g).typewrite({
            delay: 20,
            extra_char: "",
            replace_br: !0,
            speedUpOnClick: !0,
            soundLoop: "notificationTyping",
            volume: 0.12,
            callback: function () {
                n.transition({
                    opacity: 1
                }, "fast").clickExclOnce(r)
            }
        });
        UI.IS_SEGOE_UI_INSTALLED || m.find(".notificationText").addClass("fallback");
        c.append(m);
        UI.showModalContent("#platformReleaseNewsContent", {
            disableCheckForNotifications: !0,
            close: !1
        })
    }
})();
(function () {
    UI.sideBarNotificationLifeTimeInSeconds = 30;
    UI._scheduleDismissAnimation = function (a) {
        GameManager.company.sidebarNotifications.indexOf(a);
        if (a.dismissTime) {
            var b = a.dismissTime - GameManager.gameTime;
            0 > b && UI.dismissSideNotification(a).totalTime(-1 * b / 1E3)
        } else a.dismissTime = GameManager.gameTime + 1E3 * UI.sideBarNotificationLifeTimeInSeconds
    };
    GameManager.addTickListener(function (a) {
        if (GameManager.company)
            for (a = 0; a < GameManager.company.sidebarNotifications.length; a++) {
                var b = GameManager.company.sidebarNotifications[a];
                b.dismissTime ? GameManager.gameTime >= b.dismissTime ? UI.dismissSideNotification(b) : 5 < GameManager.company.sidebarNotifications.length && a < GameManager.company.sidebarNotifications.length - 5 && (b.dismissTime = GameManager.gameTime) : UI._scheduleDismissAnimation(b)
            }
    }, !0);
    var a = [];
    UI.dismissSideNotification = function (b) {
        if (-1 == a.indexOf(b)) return a.push(b), UI.startDismissAnimation(b)
    };
    UI.startDismissAnimation = function (a) {
        var b = $('.sidebarNotificationItem[gdt-notification-id="{0}"]'.format(a.id)),
            c = new TimelineMax;
        c.add(TweenMax.to(b, 3, {
            opacity: 0,
            ease: CustomEase.create("custom", "M0,0 C0,0 0.1,0.9 0.1,0.9 0.1,0.9 0.2,0 0.2,0 0.2,0 0.3,0.9 0.3,0.9 0.3,0.9 0.4,0 0.4,0 0.4,0 0.5,0.9 0.5,0.9 0.5,0.9 0.538,0 0.538,0 0.538,0 0.644,0.898 0.644,0.898 0.644,0.898 0.666,0 0.666,0 0.666,0 0.736,0.898 0.736,0.898 0.736,0.898 0.78,0 0.78,0 0.78,0 0.836,0.896 0.836,0.896 0.836,0.896 0.858,0 0.858,0 0.858,0 0.9,0.9 0.9,0.9 0.9,0.9 0.916,0 0.916,0 0.916,0 0.953,0.902 0.953,0.902 0.953,0.902 0.966,0 0.966,0 0.966,0 1,1 1,1")
        }));
        c.addCallback(function () {
            -1 != GameManager.company.sidebarNotifications.indexOf(a) && a.applyActions(GameManager.company);
            f(b, a)
        });
        GameManager.addGsapAnimationToGameTime(c);
        return c
    };
    UI.showNotificationViaSidebar = function (a) {
        if (!a.shouldShowInSidebar()) return !1;
        UI._addSidebarNotification(a);
        return !0
    };
    UI._addSidebarNotification = function (a) {
        GameManager.company.sidebarNotifications.push(a);
        GameManager.removeFromActiveNotifications(a);
        b(a, !0)
    };
    UI._resetSidebarNotificationUI = function () {
        $("#notificationSidebar").empty();
        a = [];
        for (var c = 0; c < GameManager.company.sidebarNotifications.length; c++) b(GameManager.company.sidebarNotifications[c], !1)
    };
    UI._resetCallbacks.push(UI._resetSidebarNotificationUI);
    var b = function (a, b) {
        var m = $("#sidebarNotificationItemTemplate").clone();
        m.removeAttr("id");
        m.attr("gdt-notification-id", a.id);
        m.find(".icon").attr("src", a.getNotificationPreviewImage());
        m.find(".title").text(a.header).css("font-size", UI._getMaxFontSizeSimple(a.header, 18, 190, 35));
        m.clickExclOnce(function () {
            GameManager.company.sidebarNotifications.remove(a);
            GameManager.company.activeNotifications.addRangeAt(0, a.split());
            Sound.click();
            f(m, a)
        });
        m.contextMenuExclOnce(function () {
            -1 != GameManager.company.sidebarNotifications.indexOf(a) && a.applyActions(GameManager.company);
            f(m, a)
        });
        var l = a.text;
        30 < l.length && (l = a.text.substr(0, 30) + "...");
        m.find(".previewText").text(l);
        $("#notificationSidebar").append(m);
        b && c(m, a);
        UI._scheduleDismissAnimation(a)
    },
        c = function (a, b) {
            var c = new TimelineMax;
            c.add(TweenMax.set(a, {
                y: -700,
                opacity: 0
            }));
            c.add(TweenMax.to(a, 0.4, {
                y: -50,
                opacity: 1,
                ease: Power2.easeOut
            }));
            c.addCallback(function () {
                Sound.playSoundOnce("newNotification", 0.7)
            });
            c.add(TweenMax.to(a, 0.3, {
                y: -0,
                ease: Bounce.easeOut
            }));
            GameManager.addGsapAnimationToGameTime(c)
        },
        f = function (a, b) {
            GameManager.company.sidebarNotifications.remove(b);
            (new TimelineMax).add(TweenMax.to(a, 0.4, {
                opacity: 0,
                height: 0,
                borderColor: "transparent",
                margin: 0,
                ease: Power2.easeIn,
                onComplete: function () {
                    a.remove()
                }
            }))
        }
})();
(function () {
    UI.pickTopicFontSize = void 0;
    UI._getMaxFontSizeSimple = function (a, c, f, d) {
        return UI._getMaxFontSize("{0}pt {1}", UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" : "Open Sans", c, "2pt", f, d, [a]) + "pt"
    };
    UI._getMaxFontSize = function (a, c, f, d, k, m, l) {
        for (var g = a.format(f, c), n = 0; n < l.length && f != d; n++) {
            var r = new createjs.Text(l[n], g, "black");
            if (1.1 * r.getMeasuredWidth() > k || 0 < m && 1.1 * r.getMeasuredHeight() > m) f -= 1, g = a.format(f, c), n--
        }
        return f
    };
    UI.pickTopicClick = function (a) {
        Sound.click();
        var c = "research" === a;
        if (!c) {
            var f =
                GameManager.company.currentGame;
            if (f && f.flags.lockedSettings && f.flags.lockedSettings.topic) {
                $(".simplemodal-data").find(".pickTopicButton").parent(".centeredButtonWrapper").effect("shake", {
                    times: 2,
                    distance: 5
                }, 50);
                return
            }
        } !c && a ? UI._selectTopic($(a).find(".topicButtonText").text()) : PlatformShim.execUnsafeLocalFunction(function () {
            var a = $(".simplemodal-data");
            a.find(".overlayTitle").text("Pick Topic".localize("heading"));
            var b = a.find(".listContainer");
            b.empty();
            var f = 0,
                l = 0,
                g = General.getTopicOrder(GameManager.company),
                n = c ? General.getTopicsAvailableForResearch(GameManager.company) : [];
            if (void 0 == UI.pickTopicFontSize) {
                for (var r = [], p = 0; p < g.length; p++) r.push(g[p].name);
                UI.pickTopicFontSize = UI._getMaxFontSize("{0}pt {1}", UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" : "Open Sans", 16, 10, 175, 50, r)
            }
            for (p = 0; p < g.length; p++) {
                var s = g[p];
                f++;
                3 < f && (l++, f = 1);
                var u = -1 != GameManager.company.topics.indexOf(s),
                    t = 0 < GameManager.currentResearches.filter(function (a) {
                        return a.topicId === s.id
                    }).length,
                    r = c ? !u && !t && -1 != n.indexOf(s) : u,
                    q = '<div class="pickTopicListButton selectorButton whiteButton"><img class="topicIcon" src="{{iconUrl}}"></img><span class="topicButtonText">{{name}}</span><div class="hints"></div></div>';
                (u = c && !r && !u && !t || !c && !r) ? (q = q.replace("{{name}}", "?"), q = q.replace("{{iconUrl}}", "./images/topic icons/overlay_locked.png")) : (q = q.replace("{{name}}", s.name), t = s.iconUrl ? s.iconUrl : "./images/topic icons/icon_topic_{0}.png".format(s.id.toLowerCase()), q = q.replace("{{iconUrl}}", t));
                q = $(q);
                (function (a) {
                    a.find(".topicIcon").on("error", function () {
                        a.find(".topicIcon").attr("src", "./images/topic icons/generic.png")
                    })
                })(q);
                q.disableDrag();
                r ? q.clickExclOnce(function () {
                    UI.pickTopicClick(this)
                }) : (q.addClass("disabledButton"),
                    q.removeAttr("onClick"), q.addClass("no-hover").addClass("no-click"));
                !u && GameManager.areHintsEnabled() && GameManager.company.canSetTargetAudience() && Knowledge.hasTopicAudienceWeightingKnowledge(GameManager.company, s) && (q.find(".hints").html(Knowledge.getTopicAudienceHtml(GameManager.company, s)), q.addClass("hintsEnabled"));
                q.css("position", "absolute");
                q.css("top", 140 * l + 10 * l);
                q.css("left", 190 * (f - 1) + 10);
                q.css("font-size", UI.pickTopicFontSize + "pt");
                b.append(q)
            }
            UI.createDraggable(b);
            a.find(".selectionOverlayContainer").fadeIn("fast")
        })
    };
    UI._selectTopic = function (a) {
        a && (a = a.trim());
        var c = $(".simplemodal-data").find(".pickTopicButton");
        a = a.split("\n");
        c.get(0).innerText = a[0];
        c.removeClass("selectorButtonEmpty");
        UI.maxFont(void 0, c, 18);
        $(".simplemodal-data").find(".selectionOverlayContainer").fadeOut("fast");
        UI._updateGameDefinitionNextButtonEnabled()
    };
    UI.pickPlatformClick = function (a) {
        Sound.click();
        var c = a.hasClass("platform2") ? 1 : a.hasClass("platform3") ? 2 : 0,
            f = GameManager.company.currentGame;
        if (0 === c && f && f.flags.lockedSettings && f.flags.lockedSettings.platform) $(".simplemodal-data").find("#pickPlatformButton").parent(".centeredButtonWrapper").effect("shake", {
            times: 2,
            distance: 5
        }, 50);
        else if (f && f.platforms.length < c) {
            var d = ".pickPlatformButton";
            0 < f.platforms.length && (d += ".platform" + f.platforms.length);
            $($(".simplemodal-data").find(d).get(0)).effect("pulsate", {
                times: 2
            })
        } else PlatformShim.execUnsafeLocalFunction(function () {
            var d = $(".simplemodal-data");
            d.find(".overlayTitle").text("Pick Platform".localize("heading"));
            var f = d.find(".listContainer");
            f.empty();
            var l = Platforms.getPlatformsOnMarket(GameManager.company),
                g = GameManager.company.currentGame,
                l = l.except(g.platforms);
            g.platforms.length > c && l.push(g.platforms[c]);
            l = l.slice().sort(function (a, b) {
                return Platforms.getTotalMarketSizePercent(b, GameManager.company) - Platforms.getTotalMarketSizePercent(a, GameManager.company)
            });
            if (1 < g.platforms.length && g.platforms.length > c) {
                var n = $("<div class='removePlatformButton whiteButton'></div>").text("Remove Platform".localize());
                (function (a) {
                    a.clickExcl(function () {
                        Sound.click();
                        var a = GameManager.company.currentGame.platforms;
                        a.length <= c || a.splice(c, 1);
                        $(".simplemodal-data").find(".selectionOverlayContainer").fadeOut("fast");
                        UI._updatePickPlatformButtonStates(g);
                        UI._updateGameDefinitionNextButtonEnabled();
                        UI._updateGameDefinitionCost()
                    })
                })(n);
                f.append(n)
            }
            for (var r = 0; r < l.length; r++) {
                n = $("#platformButtonTemplate").clone();
                n.removeAttr("id");
                var p = l[r];
                n.platformId = p.id;
                var s = -1 != GameManager.company.licencedPlatforms.indexOf(p);
                n.find(".platformButtonImage").attr("src", Platforms.getPlatformImage(p, GameManager.company.currentWeek));
                n.find(".platformTitle").text(p.name);
                n.find(".cost").text("Dev. cost: ".localize() + UI.getShortNumberString(p.developmentCosts));
                s ? n.find(".licenseCost").hide() : (n.find(".licenseCost").text("License cost: ".localize() + UI.getShortNumberString(p.licencePrize)), GameManager.company.cash < p.licencePrize && n.find(".licenseCost").addClass("red"));
                n.find(".marketShare").text("Marketshare: ".localize() + UI.getPercentNumberString(Platforms.getTotalMarketSizePercent(p, GameManager.company)));
                if (GameManager.areHintsEnabled()) {
                    var u = Knowledge.getPlatformAudienceHintHtml(GameManager.company, p);
                    u && n.find(".audienceHints").html(u);
                    (u = Knowledge.getPlatformGenreHintHtml(GameManager.company,
                        p)) && n.find(".genreHints").html(u)
                } (function (c) {
                    s ? (c.addClass("whiteButton"), c.clickExclOnce(function () {
                        Sound.click();
                        UI._selectPlatform(c.platformId, a)
                    })) : p.licencePrize <= GameManager.company.cash ? (c.addClass("whiteButton"), c.clickExclOnce(function () {
                        Sound.click();
                        UI.buyPlatform($(this).find(".platformTitle").get(0).innerText, function (d) {
                            d && UI._selectPlatform(c.platformId, a)
                        })
                    })) : c.addClass("disabledButton")
                })(n);
                f.append(n)
            }
            UI.createDraggable(f);
            d.find(".selectionOverlayContainer").fadeIn("fast")
        })
    };
    var a = function (a, c) {
        var f = GameManager.company.currentGame.platforms;
        if (f.length == a) f.push(c);
        else if (f.length >= a) f[a] = c;
        else throw "unexpected platform length";
        UI._updatePickPlatformButtonStates(GameManager.company.currentGame)
    };
    UI.getMeasuredWidth = function (a, c) {
        var f = "bold {0}pt {1}".format(c, UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" : "Open Sans");
        a = new createjs.Text(a, f, "black");
        return 1.1 * a.getMeasuredWidth()
    };
    UI.getMeasuredHeight = function (a, c, f) {
        c = "bold {0}pt {1}".format(c, UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" :
            "Open Sans");
        a = new createjs.Text(a, c, "black");
        f && (a.lineWidth = f);
        return 1.1 * a.getMeasuredHeight()
    };
    UI._updatePickPlatformButtonStates = function (a) {
        for (var c = $(".simplemodal-data"), f = 0; 3 > f; f++) {
            var d = ".pickPlatformButton";
            0 < f && (d += ".platform" + (f + 1));
            var d = $(c.find(d).get(0)),
                k = "Pick Platform".localize();
            GameManager.company.canDevelopMultiPlatform();
            a.platforms.length >= f ? (d.removeClass("selectorButtonEmpty").removeClass("selectorButtonInactive windowStepActionButtonDisabled").addClass("selectorButton windowStepActionButton"),
                a.platforms[f] && (k = a.platforms[f].name), d.text(k)) : d.addClass("selectorButtonInactive windowStepActionButtonDisabled").removeClass("selectorButton windowStepActionButton").text("Pick Platform".localize());
            UI.maxFont(void 0, d, 18, k)
        }
    };
    UI._selectPlatform = function (b, c) {
        var f = GameManager.company.licencedPlatforms.first(function (a) {
            return a.id === b
        }),
            d = c ? $(c) : $(".simplemodal-data").find("#pickPlatformButton");
        d.get(0).innerText = f.name;
        $(".simplemodal-data").find("#gameDefinition") && a(d.hasClass("platform2") ?
            1 : d.hasClass("platform3") ? 2 : 0, f);
        d.removeClass("selectorButtonEmpty");
        $(".simplemodal-data").find(".selectionOverlayContainer").fadeOut("fast");
        UI._updateGameDefinitionNextButtonEnabled();
        UI._updateGameDefinitionCost()
    };
    UI.buyPlatform = function (a, c) {
        var f = GameManager.company.availablePlatforms.concat(GameManager.company.licencedPlatforms).first(function (c) {
            return c.name == a
        });
        if (f) {
            var d = "You require a developer license to be able to develop for this platform.<br/><br/> Do you want to pay <strong>{0}</strong> to acquire a license for the <strong>{1}</strong>?".localize().format(UI.getLongNumberString(f.licencePrize),
                f.name);
            $("#purchasePlatformDialog").find(".purchasePlatformMessage").html(PlatformShim.toStaticHtml(d));
            $("#purchasePlatformDialog").dialog({
                draggable: !1,
                modal: !0,
                resizable: !1,
                show: "fade",
                zIndex: 6E3,
                open: function () {
                    $(this).siblings(".ui-dialog-titlebar").remove();
                    $(this).find(".cancelActionButton").clickExclOnce(function () {
                        Sound.click();
                        $("#purchasePlatformDialog").dialog("close")
                    });
                    $(this).find(".confirmActionButton").clickExclOnce(function () {
                        Sound.click();
                        $("#purchasePlatformDialog").dialog("close");
                        GameManager.buyPlatform(f);
                        c(!0)
                    });
                    UI.maxFont("bolder", $(this).find(".windowTitle"), 34)
                }
            })
        }
    };
    UI.pickGenreClick = function (a) {
        Sound.click();
        var c = GameManager.company.currentGame;
        c && c.flags.lockedSettings && c.flags.lockedSettings.genre ? $(".simplemodal-data").find("#pickGenreButton").parent(".centeredButtonWrapper").effect("shake", {
            times: 2,
            distance: 5
        }, 50) : a ? UI._selectGenre($(a).find(".topicButtonText").text()) : PlatformShim.execUnsafeLocalFunction(function () {
            var a = $(".simplemodal-data");
            a.find(".overlayTitle").text("Pick Genre".localize("heading"));
            var b = a.find(".listContainer");
            b.empty();
            for (var c = General.getAvailableGenres(GameManager.company), m = a.find("#pickSecondGenreButton").get(0).innerText, l = 0, g = 0, n = 0; n < c.length; n++) {
                l++;
                2 < l && (g++, l = 1);
                var r = c[n],
                    p = r.iconUrl ? r.iconUrl : "./images/genre icons/icon_genre_{0}.png".format(r.id.toLowerCase()),
                    r = '<div class="selectorButton pickTopicListButton"><img class="topicIcon" src="{{iconUrl}}"></img><span class="topicButtonText">{{name}}</span></div>'.replace("{{name}}", r.name).replace("{{iconUrl}}", p),
                    r = $(r);
                (function (a) {
                    a.find(".topicIcon").on("error", function () {
                        a.find(".topicIcon").attr("src", "./images/genre icons/generic.png")
                    })
                })(r);
                r.css("position", "absolute");
                r.css("top", 140 * g + 10 * g);
                r.css("left", 190 * (l - 1) + 110);
                r.addClass("whiteButton");
                p = m != c[n].name;
                r.disableDrag();
                p ? r.clickExclOnce(function () {
                    UI.pickGenreClick(this)
                }) : (r.addClass("disabledButton"), r.removeAttr("onClick"), r.addClass("no-hover").addClass("no-click"));
                b.append(r);
                UI.createDraggable(b)
            }
            a.find(".selectionOverlayContainer").fadeIn("fast")
        })
    };
    UI._selectGenre = function (a, c) {
        var f = 2 == c ? $(".simplemodal-data").find("#pickSecondGenreButton") : $(".simplemodal-data").find("#pickGenreButton"),
            d = f.get(0).innerText;
        d && (d = d.trim());
        a == d ? (f.text("Pick Genre".localize()), f.addClass("selectorButtonEmpty")) : (f.text(a), f.removeClass("selectorButtonEmpty"));
        f = GameGenre.getAll().first(function (c) {
            return c.name == a
        });
        d = GameManager.company.currentGame;
        2 != c ? (d.genre = f, d.genre && $(".simplemodal-data").find("#pickSecondGenreButton").removeClass("selectorButtonInactive windowStepActionInactive").addClass("selectorButton windowStepActionButton")) :
            d.secondGenre = f;
        $(".simplemodal-data").find(".selectionOverlayContainer").fadeOut("fast");
        UI._updateGameDefinitionNextButtonEnabled()
    };
    UI.pickSecondGenreClick = function (a) {
        Sound.click();
        var c = GameManager.company.currentGame;
        c && c.flags.lockedSettings && c.flags.lockedSettings.secondGenre ? $(".simplemodal-data").find("#pickSecondGenreButton").parent(".centeredButtonWrapper").effect("shake", {
            times: 2,
            distance: 5
        }, 50) : c && !c.genre ? $(".simplemodal-data").find("#pickGenreButton").effect("pulsate", {
            times: 2
        }) : a ?
            UI._selectGenre($(a).find(".topicButtonText").text(), 2) : PlatformShim.execUnsafeLocalFunction(function () {
                var a = $(".simplemodal-data");
                a.find(".overlayTitle").text("Pick Genre".localize("heading"));
                var b = a.find(".listContainer");
                b.empty();
                for (var c = General.getAvailableGenres(GameManager.company), m = a.find("#pickGenreButton").get(0).innerText, l = 0, g = 0, n = 0; n < c.length; n++) {
                    l++;
                    2 < l && (g++, l = 1);
                    var r = c[n],
                        p = r.iconUrl ? r.iconUrl : "./images/genre icons/icon_genre_{0}.png".format(r.id.toLowerCase()),
                        r = '<div class="selectorButton pickTopicListButton"><img class="topicIcon" src="{{iconUrl}}"></img><span class="topicButtonText">{{name}}</span></div>'.replace("{{name}}",
                            r.name).replace("{{iconUrl}}", p),
                        r = $(r);
                    (function (a) {
                        a.find(".topicIcon").on("error", function () {
                            a.find(".topicIcon").attr("src", "./images/genre icons/generic.png")
                        })
                    })(r);
                    r.css("position", "absolute");
                    r.css("top", 140 * g + 10 * g);
                    r.css("left", 190 * (l - 1) + 110);
                    r.addClass("whiteButton");
                    r.disableDrag();
                    m == c[n].name ? (r.addClass("disabledButton"), r.removeAttr("onClick"), r.addClass("no-hover").addClass("no-click")) : r.clickExclOnce(function () {
                        UI.pickSecondGenreClick(this)
                    });
                    b.append(r)
                }
                UI.createDraggable(b);
                a.find(".selectionOverlayContainer").fadeIn("fast")
            })
    };
    UI.pickEngineClick = function (a) {
        Sound.click();
        if (a) {
            var c = GameManager.company.engines.first(function (c) {
                return c.id === a.engineId
            }),
                f = c.name,
                d = $(".simplemodal-data").find(".pickEngineButton");
            d.get(0).innerText = f;
            $(".simplemodal-data").find("#gameDefinition") && (GameManager.company.currentGame.engine = c);
            d.removeClass("selectorButtonEmpty");
            $(".simplemodal-data").find(".selectionOverlayContainer").fadeOut("fast");
            UI._updateGameDefinitionNextButtonEnabled()
        } else PlatformShim.execUnsafeLocalFunction(function () {
            var a =
                $(".simplemodal-data");
            a.find(".overlayTitle").text("Pick Engine".localize("heading"));
            var b = a.find(".listContainer");
            b.empty();
            var c = $('<div class="engineButtonContainer"></div>');
            b.append(c);
            for (var d = $("#engineButtonTemplate").get(0).outerHTML, f = GameManager.company.engines.slice().reverse(), r = 0; r < f.length; r++) {
                var p = f[r],
                    s = $(d);
                s.engineId = p.id;
                s.text(p.name);
                s.addClass("whiteButton");
                (function (a) {
                    a.clickExcl(function () {
                        UI.pickEngineClick(a)
                    })
                })(s);
                p = $('<div class="centeredButtonWrapper"></div>');
                p.append(s);
                c.append(p)
            }
            UI.createDraggable(b);
            a.find(".selectionOverlayContainer").fadeIn("fast")
        })
    }
})();
(function () {
    var a = !1,
        b;
    UI._showGameDefinition = function (b, d, f) {
        if (!f && GameManager.flags.selectGameActive) {
            var g = GameManager.gameId;
            UI.showGameHistory(function () {
                if (g == GameManager.gameId)
                    if (GameManager.flags.selectGameActive = !1, GameManager.flags.selectedGameId) {
                        var a = GameManager.flags.selectedGameId,
                            c = GameManager.company.currentGame,
                            f = GameManager.company.getGameById(a);
                        c.sequelTo = a;
                        c.genre = f.genre;
                        c.secondGenre = f.secondGenre;
                        c.topic = f.topic;
                        c.targetAudience = f.targetAudience;
                        c.gameSize = f.gameSize;
                        GameManager.flags.createPack &&
                            (c.flags.lockedSettings || (c.flags.lockedSettings = {}), c.flags.lockedSettings.topic = !0, c.flags.lockedSettings.genre = !0, c.flags.lockedSettings.platform = !0, c.flags.lockedSettings.targetAudience = !0, c.secondGenre && (c.flags.lockedSettings.secondGenre = !0), c.flags.lockedSettings.mmo = !0, c.flags.mmo = !0, c.platforms = f.platforms.slice());
                        GameManager.flags.selectedGameId = null;
                        UI._showGameDefinition(b, d, !0)
                    } else GameManager.removeFromActiveNotifications(b), GameManager.gameDefinitionCancelled()
            }, !0)
        } else UI.showGameDefinition(GameManager.company, {
            close: !0,
            disableCheckForNotifications: !0,
            onOpen: function () {
                var a = GameManager.company.currentGame;
                a.topic && UI._selectTopic(a.topic.name);
                var b = a.secondGenre;
                a.genre ? UI._selectGenre(a.genre.name) : a.secondGenre || $(".simplemodal-data").find("#pickSecondGenreButton").addClass("selectorButtonInactive windowStepActionButtonDisabled").removeClass("selectorButton windowStepActionButton");
                b && UI._selectGenre(b.name, 2);
                UI._updatePickPlatformButtonStates(a);
                if (a.targetAudience) {
                    var c = a.targetAudience,
                        b = $(".simplemodal-data");
                    b.find(".rating").removeClass("selected");
                    c = b.find("young" === c ? ".ratingY" : "mature" === c ? ".ratingM" : ".ratingE");
                    c.addClass("selected");
                    c.hasClass("rating") && b.find(".ratingLabel").text(p(c))
                }
                a.gameSize && (b = a.gameSize, c = $(".simplemodal-data"), c.find(".gameSizeButton").removeClass("selected"), c.find("small" === b ? ".gameSizeSmall" : "medium" === b ? ".gameSizeMedium" : "large" === b ? ".gameSizeLarge" : ".gameSizeAAA").addClass("selected"));
                a.flags.mmo && (a = a.flags.mmo, b = $(".simplemodal-data").find(".gameGenreMMO"), b.removeClass("selected"),
                    a && b.addClass("selected"));
                UI._updateGameDefinitionCost();
                UI._updateGameDefinitionNextButtonEnabled()
            },
            onClose: function () {
                c && (clearInterval(c), c = void 0);
                a ? GameManager.removeFromActiveNotifications(b) : (GameManager.removeFromActiveNotifications(b), GameManager.gameDefinitionCancelled())
            }
        })
    };
    var c = 0,
        f = function (a) {
            var b;
            a.focus(function () {
                c && clearInterval(c);
                b = Date.now();
                c = setInterval(function () {
                    b && 6E4 <= Date.now() - b && (Achievements.activate(Achievements.writersBlock), GameManager.checkAchievements(), clearInterval(c))
                },
                    1E3)
            });
            a.blur(function () {
                clearInterval(c);
                c = 0
            })
        };
    UI.showGameDefinition = function (c, d) {
        var g = c.currentGame;
        $(".selectionOverlayContainer").hide();
        var k = $(".gameDefinitionContent");
        k.empty();
        var l = $("#gameDefinitionContentTemplate").clone();
        l.find("#gameTitle").attr("value", c.currentGame.title);
        b = c.currentGame.title;
        f(l.find("#gameTitle"));
        l.find(".pickTopicButton").clickExcl(function () {
            UI.pickTopicClick()
        });
        l.find("#pickGenreButton").clickExcl(function () {
            UI.pickGenreClick()
        });
        l.find("#pickSecondGenreButton").clickExcl(function () {
            UI.pickSecondGenreClick()
        });
        l.find(".pickPlatformButton").clickExcl(function () {
            UI.pickPlatformClick($(this))
        });
        l.find(".pickEngineButton").clickExcl(function () {
            UI.pickEngineClick()
        });
        c.canDevelopMediumGames() ? (c.canDevelopLargeGames() || l.find(".gameSizeLarge").hide(), c.canDevelopAAAGames() || l.find(".gameSizeAAA").hide()) : l.find("#gameSizeGroup").hide();
        c.canDevelopMMOGames() || l.find(".gameGenreMMO").hide();
        c.canUseMultiGenre() ? (l.find("#pickSecondGenreButton").css("margin-left", "2.5px").css("margin-right", "2.5px").css("width",
            "145px"), l.find("#pickGenreButton").css("margin-left", "2.5px").css("margin-right", "2.5px").css("width", "145px")) : l.find("#pickSecondGenreButton").hide();
        c.canDevelopMultiPlatform() ? l.find(".pickPlatformButton").css("margin-left", "2.5px").css("margin-right", "2.5px").css("width", "145px") : l.find(".pickPlatformButton").slice(1).hide();
        c.canSetTargetAudience() || l.find("#targetRating").hide();
        l.find(".gameDefSelection").clickExcl(function () {
            Sound.click();
            var a = $(this);
            if (!(a.hasClass("rating") && g.flags.lockedSettings &&
                g.flags.lockedSettings.targetAudience || a.hasClass("gameSizeButton") && g.flags.lockedSettings && g.flags.lockedSettings.gameSize)) {
                if (a.hasClass("gameGenreMMO")) {
                    if (g.flags.lockedSettings && g.flags.lockedSettings.mmo) return;
                    a.hasClass("selected") ? a.removeClass("selected") : a.addClass("selected")
                } else a.parent().find(".gameDefSelection").removeClass("selected"), a.addClass("selected"), a.hasClass("rating") ? l.find(".ratingLabel").text(p(a)) : a.hasClass("gameSizeButton") && (g.gameSize = u(l.find(".gameSizeButton.selected")));
                UI._updateGameDefinitionCost();
                UI._updateGameDefinitionNextButtonEnabled()
            }
        });
        l.find(".windowCostLabel").hide();
        0 === c.engines.length ? l.find(".pickEngineButtonWrapper").hide() : l.find(".pickEngineButtonWrapper").show();
        var m = null != GameManager.company.currentGame.sequelTo,
            n = $("#gameDefinition").find(".dialogScreen1Title");
        m ? (m = GameManager.company.getGameById(GameManager.company.currentGame.sequelTo), null === m ? (GameManager.company.currentGame.sequelTo = null, n.removeClass("smallerWindowTitle").text("Game Concept".localize())) :
            n.addClass("smallerWindowTitle").text("Sequel to {0}".localize().format(m.title))) : n.removeClass("smallerWindowTitle").text("Game Concept".localize());
        $("#gameDefinition").find(".dialogNextButton").clickExcl(function () {
            $("#gameDefinition").find(".dialogNextButton").effect("shake", {
                times: 2,
                distance: 5
            }, 50)
        });
        var r = Research.getAllItems().filter(function (a) {
            return "graphic-type" === a.group
        }).map(function (a) {
            return a.id
        });
        $("#gameDefinition").find(".dialogBackButton").clickExcl(function () {
            Sound.click();
            UI._saveSelectedGameFeatureSettings(function (a) {
                return -1 != r.indexOf(a)
            });
            $("#gameDefinition").find(".dialogScreen1").transition({
                "margin-left": 0
            });
            $("#gameDefinition").find(".dialogScreen2").transition({
                "margin-left": "100%"
            })
        });
        a = !1;
        PlatformShim.execUnsafeLocalFunction(function () {
            k.append(l);
            var a = k.find(".gameSizeSmall");
            UI.maxFont(void 0, a, 18);
            a = k.find(".gameSizeMedium");
            UI.maxFont(void 0, a, 18);
            a = k.find(".gameSizeLarge");
            UI.maxFont(void 0, a, 18);
            a = k.find(".gameSizeAAA");
            UI.maxFont(void 0, a, 18);
            a =
                k.find("#pickSecondGenreButton");
            UI.maxFont(void 0, a, 18);
            a = k.find("#pickGenreButton");
            UI.maxFont(void 0, a, 18);
            a = k.find(".pickEngineButton");
            UI.maxFont(void 0, a, 18);
            a = k.find(".pickTopicButton");
            UI.maxFont(void 0, a, 18);
            UI.showModalContent("#gameDefinition", d)
        })
    };
    var d = function () {
        var a = $(".simplemodal-data").find(".pickTopicButton").text();
        a && (a = a.trim());
        return GameManager.company.topics.first(function (b) {
            return b.name == a
        })
    },
        k = function () {
            var a = $(".simplemodal-data").find("#pickGenreButton").text();
            return GameGenre.getAll().first(function (b) {
                return b.name == a
            })
        },
        m = function () {
            var a = $(".simplemodal-data").find("#pickSecondGenreButton").text();
            return GameGenre.getAll().first(function (b) {
                return b.name == a
            })
        },
        l = function () {
            var a = $(".simplemodal-data").find(".pickEngineButton").get(0).innerText;
            return GameManager.company.engines.first(function (b) {
                return b.name.trim() == a.trim()
            })
        };
    UI._updateGameDefinitionCost = function () {
        var a = $(".simplemodal-data"),
            b = GameManager.company.currentGame,
            c;
        c = 0 + s(u(a.find(".gameSizeButton.selected")));
        b && 0 < b.platforms.length && (c += b.platforms.sum(function (a) {
            return a ? a.developmentCosts : 0
        }), c *= General.getMultiPlatformCostFactor(b), c += UI._getGameFeatureCosts());
        a.find(".gameGenreMMO").hasClass("selected") && (c *= 4);
        a = a.find(".windowCostLabel");
        UI.maxFont(void 0, a, 20, "Cost: {0}".localize().format(UI.getShortNumberString(c)));
        a.fadeIn();
        return c
    };
    var g = function (a) {
        a || (a = $(".simplemodal-data"));
        if (d() && k()) {
            var b = GameManager.company.currentGame;
            b.topic = d();
            b.genre = k();
            b.secondGenre = m();
            GameManager.areHintsEnabled() &&
                Knowledge.hasComboKnowledge(GameManager.company, b) ? (a = a.find(".comboHint"), a.text("{0} combo".localize().format(Knowledge.getComboHintText(b))), UI.maxFont(void 0, a, 14)) : a.find(".comboHint").text("")
        }
    };
    UI._updateGameDefinitionNextButtonEnabled = function () {
        var a = $(".simplemodal-data"),
            b = a.find(".dialogNextButton");
        UI.maxFont(void 0, a.find(".windowMainActionButton"), 22);
        if (0 !== b.length) {
            var c = GameManager.company.currentGame,
                f = d() && 0 < c.platforms.length && k();
            g(a);
            var m = "",
                n = u(a.find(".gameSizeButton.selected"));
            n && "small" != n && (c = c.platforms.filter(function (a) {
                return !Platforms.doesPlatformSupportGameSize(a, n)
            }), 0 < c.length && (m = c.first(), m = "{0} does not support {1} games!".localize("{0} platform, {1} game size").format(m.name, General.getGameSizeLabel(n))));
            a.find(".gameGenreMMO").hasClass("selected") && "large" != n && "aaa" != n && (m = "MMO's cannot be small or medium.".localize());
            0 == m.length && (c = l()) && a.find(".gameGenreMMO").hasClass("selected") && !c.parts.some(function (a) {
                return "mmoSupport" === a.id
            }) && (m = "Engine does not support MMO.".localize());
            a = a.find(".gameDefinitionWarningText");
            0 < m.length ? (f = UI._getMaxFontSize("{0}pt {1}", UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" : "Open Sans", 16, 8, 380, 40, [m]), a.css("font-size", f + "pt"), a.text(m).fadeIn().effect("pulsate", {
                times: 3
            }), f = !1) : a.fadeOut();
            f ? (b.clickExcl(function () {
                Sound.click();
                PlatformShim.execUnsafeLocalFunction(function () {
                    r()
                });
                $("#gameDefinition").find(".dialogScreen1").transition({
                    "margin-left": "-200%"
                });
                $("#gameDefinition").find(".dialogScreen2").transition({
                    "margin-left": 0
                })
            }), b.removeClass("baseButton").addClass("selectorButton").addClass("orangeButton"),
                PlatformShim.execUnsafeLocalFunction(function () {
                    r()
                })) : b.removeClass("selectorButton").removeClass("orangeButton").addClass("baseButton").addClass("disabledButton").clickExcl(function () {
                    b.effect("shake", {
                        times: 2,
                        distance: 5
                    }, 50)
                })
        }
    };
    var n = [];
    UI._getSelectedFeatures = function () {
        return n
    };
    UI._getGameFeatureCosts = function () {
        if (!n || 0 == n.length) return 0;
        var a = GameManager.company.currentGame.features;
        return (a ? n.except(a) : n).sum(function (a) {
            return Research.getDevCost(a, GameManager.company.currentGame)
        })
    };
    UI.generateFeatureElement = function (a, b) {
        var c = $("#selectableGameFeatureItem").clone();
        c.attr("feature-id", a.id);
        GameManager.areHintsEnabled() && a.isSkillTraining && c.append($('<div style="font-size:12pt;"><span>{0}</span>{1}</div>'.format("Effect: ".localize(), Knowledge.getTrainingKnowledgeHtml(a))));
        c.enableActiveClassOnClick();
        return c
    };
    var r = function () {
        UI._updateFeatureListContainer({
            filter: function (a) {
                return void 0 != a.techLevel || "Special Items" === a.category || "DRM" == a.category
            }
        }, !0);
        UI._updateGameDefinitionCost();
        var a = $(".simplemodal-data").find(".featureSelectionPanel");
        a.hasClass("featureSelectionPanelHiddenState") && (a.removeClass("featureSelectionPanelHiddenState"), a.addClass("featureSelectionShowState"))
    };
    UI.maxFont = function (a, b, c, d, f) {
        void 0 != b && 0 < b.length && (d = d ? d : b[0].innerText, void 0 != d && 0 < d.length && (d = d.trim(), a = UI._getMaxFontSize(a ? a + " {0}pt {1}" : "{0}pt {1}", UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" : "Open Sans", c, 4, f ? b.width() : b.width() - 11, f ? b.height() : b.height() - 11, [d]), c = $("<span>{0}</span>".format(d)),
            c.css("font-size", a + "pt"), b.empty().append(c)))
    };
    UI._updateFeatureListContainer = function (a, b) {
        var c = a;
        c || (c = {
            readOnly: !1
        });
        var d = c.onChange;
        d || (d = function () {
            UI._updateGameDefinitionCost()
        });
        var f = $(".simplemodal-data");
        UI.maxFont("bolder", f.find(".dialogScreen1Title"), 34);
        UI.maxFont("bolder", f.find(".dialogScreen2Title"), 34);
        var g = f.find(".featureSelectionContainer"),
            k = GameManager.company.currentGame,
            f = GameManager.getAvailableGameFeatures(k.engine).filter(function (a) {
                return !a.canUse || a.canUse(k)
            }).groupBy(function (a) {
                return a.category
            });
        g.empty();
        n = [];
        var l = null,
            m = [],
            p = function (a, b) {
                if (a.hasClass("selectedFeature")) "graphic-type" !== b.group && (a.removeClass("selectedFeature"), n.remove(b), d());
                else {
                    if (b.group) {
                        var c = ".radioButton" + m.indexOf(b.group);
                        g.find(c).removeClass("selectedFeature");
                        for (var c = n.filter(function (a) {
                            return a.group === b.group
                        }), f = 0; f < c.length; f++) n.remove(c[f])
                    }
                    a.addClass("selectedFeature");
                    n.push(b);
                    d()
                }
            };
        c.categories && 0 < c.categories.length && (f = f.filter(function (a) {
            return -1 != c.categories.indexOf(a.category)
        }));
        c.filter &&
            (f = f.filter(c.filter));
        var r = $("#featureCategoryHeading");
        b && (f = f.slice().sort(function (a, b) {
            return a.techLevel - b.techLevel
        }));
        for (var s = 0; s < f.length; s++) {
            var t = f[s];
            if (t.category != l) {
                l = r.clone();
                l.removeAttr("id");
                var u = Missions.getMissionWithId(t.category);
                u && l.attr("mission-id", u.id);
                l.text(u ? u.name : t.categoryDisplayName);
                g.append(l);
                l = t.category
            }
            var u = UI.generateFeatureElement(t, l),
                G = GameManager.company.currentGame.features,
                G = (G = G && -1 != G.indexOf(t) ? 0 : Research.getDevCost(t, GameManager.company.currentGame)) ?
                    "{0} ({1})".format(t.name, UI.getShortNumberString(G)) : t.name;
            u.find(".featureContent").text(G);
            t.group && (-1 == m.indexOf(t.group) && m.push(t.group), G = "radioButton" + m.indexOf(t.group), u.addClass(G));
            c.readOnly || function (a, b) {
                a.clickExcl(function () {
                    Sound.click();
                    p(a, b)
                })
            }(u, t);
            g.append(u); - 1 != GameManager.uiSettings.selectedGameFeatures.indexOf(t.id) ? p(u, t) : "graphic-type" !== t.group || n.some(function (a) {
                return "graphic-type" === a.group
            }) || p(u, t)
        }
        UI.createDraggable(g);
        return f.length
    };
    UI._saveSelectedGameFeatureSettings =
        function (a) {
            if (a) {
                var b = GameManager.uiSettings.selectedGameFeatures.filter(function (b) {
                    return !a(b)
                });
                GameManager.uiSettings.selectedGameFeatures = b.concat(n.map(function (a) {
                    return a.id
                }).filter(function (b) {
                    return a(b)
                }))
            } else if (GameFlags.ghg6) throw "unexpected method call";
        };
    var p = function (a) {
        var b = null;
        a.hasClass("ratingY") ? b = "Young".localize("audience category") : a.hasClass("ratingE") ? b = "Everyone".localize("audience category") : a.hasClass("ratingM") && (b = "Mature".localize("audience category"));
        return b
    },
        s = function (a) {
            switch (a) {
                case "aaa":
                    return 1E7;
                case "large":
                    return 15E5;
                case "medium":
                    return 15E4;
                default:
                    return 0
            }
        },
        u = function (a) {
            var b = null;
            a.hasClass("gameSizeSmall") ? b = "small" : a.hasClass("gameSizeMedium") ? b = "medium" : a.hasClass("gameSizeLarge") ? b = "large" : a.hasClass("gameSizeAAA") && (b = "aaa");
            return b
        },
        t = function () {
            var a = GameManager.company,
                c = a.currentGame,
                d = null;
            c.sequelTo && (d = a.getGameById(c.sequelTo));
            a = a.gameLog.concat(a.trashedGames);
            c.engine && (c.flags.isNewBetterEngine = !a.some(function (a) {
                return a.engine &&
                    a.engine.techLevel >= c.engine.techLevel
            }));
            a.some(function (a) {
                return a.secondGenre === c.secondGenre && a.genre === c.genre && a.topic === c.topic
            }) || (c.researchFactor = Research.FACTOR_FOR_NEW_COMBINATIONS, c.flags.isNewCombination = !0);
            a = !a.some(function (a) {
                return a.topic.id === c.topic.id
            });
            c.flags.isNewTopic = a;
            d && (d.engine && c.engine && d.engine.id === c.engine.id ? c.flags.usesSameEngineAsSequel = !0 : c.engine && (!d.engine || c.engine.techLevel > d.engine.techLevel) && (c.flags.hasBetterEngineThanSequel = !0));
            c.flags.hasCustomName =
                c.title != b;
            !0 === GameManager.flags.createPack && (c.flags.isExtensionPack = !0)
        };
    UI.closeGameDefinition = function () {
        Sound.click();
        var b = GameManager.company.currentGame,
            c = $(".simplemodal-data"),
            f = c.find("#gameTitle")[0].value;
        b.title = f;
        f = c.find(".rating.selected");
        b.targetAudience = f.hasClass("ratingY") ? "young" : !f.hasClass("ratingE") && f.hasClass("ratingM") ? "mature" : "everyone";
        f = u(c.find(".gameSizeButton.selected"));
        b.gameSize = f;
        if (f = d())
            if (b.topic = f, f = k()) {
                b.genre = f;
                if (f = m()) b.secondGenre = f;
                0 != b.platforms.length &&
                    (f = l(), b.engine = f, b.costs = UI._updateGameDefinitionCost(), b.features = n, b.flags.techLevel = b.features.filter(function (a) {
                        return void 0 != a.techLevel
                    }).average(function (a) {
                        return a.techLevel
                    }), c.find(".gameGenreMMO").hasClass("selected") && (b.flags.mmo = !0), t(), a = !0, UI.closeModal(function () {
                        VisualsManager.gameStatusBar.updateGameName();
                        VisualsManager.gameStatusBar.updatePoints();
                        VisualsManager.gameStatusBar.progressBar.alpha = 0;
                        GameManager.notifyIdleState()
                    }))
            }
    }
})();
(function () {
    UI.getDevStageSliderValues = function (a) {
        return GameManager.uiSettings["stage{0}SliderValues".format(a)]
    };
    UI.selectedFeatures = [];
    var a = [],
        b = [],
        c = 0,
        f = [],
        d = [];
    UI.showFeatureList = function (g, p) {
        var r = GameManager.company.currentGame.isStaffResponsibilityEnabled();
        UI.selectedFeatures = [];
        a = [];
        b = [];
        f = [];
        d = [];
        for (var q = UI.getDevStageSliderValues(GameManager.getCurrentDevStage()), v = 0; v < g.length; v++) UI.selectedFeatures.push(g[v]);
        PlatformShim.execUnsafeLocalFunction(function () {
            var c = $("#selectFeatureMenu");
            c.empty();
            var d = $("#selectFeatureMenuTemplate").clone();
            d.find(".focusSliderStaffName").css("opacity", 0);
            var f = GameManager.company.currentGame;
            d.find(".featureWindowTitle").text("Development Stage {0}".localize().format(GameManager.getCurrentDevStage()));
            d.find(".gameName").text(f.title);
            f.secondGenre ? d.find(".topicGenre").text(f.topic.name + "/" + f.genre.name + "-" + f.secondGenre.name) : d.find(".topicGenre").text(f.topic.name + "/" + f.genre.name);
            d.find(".featureDurationPreview").each(function (b, c) {
                var d =
                    $(c);
                a.push(d)
            });
            d.find(".focusSliderWrapper").each(function (a, c) {
                var d = $(c);
                r && l(d.find(".focusSliderStaffName"), g[a]);
                b.push(d);
                d.value = q[a];
                d.find(".focusSlider").slider({
                    orientation: "vertical",
                    range: "min",
                    min: 0,
                    max: 100,
                    value: q[a],
                    animate: !1,
                    slide: function (a, b) {
                        d.value = b.value;
                        UI._updateFeatureFocusPreview()
                    }
                });
                d.find(".focusSliderTitle")[0].innerText = "{0} Lvl. {1}".localize("{0} feature name, {1} lvl number").format(g[a].name, LevelCalculator.getMissionLevel(g[a]));
                var p = d.find(".focusSliderHint"),
                    u = "";
                if (GameManager.areHintsEnabled()) {
                    var v = Knowledge.getMissionWeightingHint(Missions.getMissionWithId(g[a].id), f);
                    v && (u = v.hint, v.exactMatch ? p.removeClass("unsure") : (p.addClass("unsure"), u += " ?"))
                }
                p.text(u);
                r && d.droppable({
                    hoverClass: "dragHover",
                    tolerance: "pointer",
                    drop: function (b, c) {
                        var d = $(this).find(".focusSliderStaffName"),
                            f = d.text(),
                            l, p = void 0;
                        c.draggable.hasClass("focusSliderStaffName") ? (l = c.draggable.text(), p = c.draggable) : l = c.draggable.find(".staffName,").text();
                        k(d, l) && (m(g[a], l), p && (k(p,
                            f), d = m, p = p.parent(".focusSliderWrapper"), p = p.hasClass("feature1") ? 0 : p.hasClass("feature2") ? 1 : p.hasClass("feature3") ? 2 : void 0, d(g[p], f)), n())
                    }
                })
            });
            c.append(d)
        });
        UI.showModalContent("#selectFeatureMenu", {
            close: !1,
            onOpen: function () {
                var a = $(".simplemodal-data"),
                    b = $("#canvasScrollContainer").width(),
                    f = $("#simplemodal-container");
                f.removeClass("smallScreenPopup");
                1024 >= b && (f.addClass("smallScreenPopup"), b = f.width(), f = f.height(), b = 0.9 * (0.5 * window.innerWidth - 0.5 * b), f = 0.9 * (0.5 * window.innerHeight - 0.5 * f), $("#simplemodal-container").css({
                    zoom: "90%",
                    left: b,
                    top: f
                }));
                c = a.find(".featureDurationPreviewWrapper").width();
                GameManager.company.currentGame.isStaffResponsibilityEnabled() ? UI._updateStaffListForFeatures() : GameManager.company.currentGame.flags.featureResponsibility = {};
                var k = !1,
                    l = function () {
                        var b = UI.getShortNumberString(UI._getGameFeatureCosts());
                        a.find(".featureSelectionPanel .cost").text("Cost: {0}".localize().format(b))
                    },
                    m = GameManager.company.currentGame.features.map(function (a) {
                        return a.id
                    }),
                    f = UI._updateFeatureListContainer({
                        readOnly: !1,
                        categories: g.map(function (a) {
                            return a.id
                        }),
                        filter: function (a) {
                            return "graphic-type" != a.group || -1 != m.indexOf(a.id)
                        },
                        onChange: function () {
                            l();
                            k && UI._updateFeatureFocusPreview()
                        }
                    });
                l();
                k = !0;
                a.find(".featureSelectionCategoryHeading").each(function (a, b) {
                    var c = $(b);
                    c.missionId = c.attr("mission-id");
                    d.push(c)
                });
                0 < f && a.find(".featureSelectionPanel").delay(200).queue(function () {
                    $(this).removeClass("featureSelectionPanelHiddenState").addClass("featureSelectionShowState");
                    $(this).dequeue()
                });
                r && (a.find(".featureStaffAsignPanel").delay(200).queue(function () {
                    $(this).removeClass("hidden").addClass("showState");
                    $(this).dequeue()
                }), a.find(".focusSliderStaffName").draggable({
                    helper: "clone",
                    zIndex: 7E3,
                    appendTo: a,
                    start: function (a, b) {
                        b.helper.addClass("staffItemBorder")
                    }
                }));
                UI.maxFont(a.find("bolder", ".featureWindowTitle"), 34);
                UI.maxFont(a.find(void 0, ".feature1").find(".focusSliderTitle"), 16);
                UI.maxFont(a.find(void 0, ".feature2").find(".focusSliderTitle"), 16);
                UI.maxFont(a.find(void 0, ".feature3").find(".focusSliderTitle"), 16);
                UI.maxFont(a.find("bolder", ".featureSelectionPanel").find(".windowTitle"), 22);
                UI._updateFeatureFocusPreview()
            },
            onClose: p.onClose,
            disableCheckForNotifications: !0
        })
    };
    var k = function (a, b) {
        if (a.text() != b) return a.transition({
            opacity: 0
        }, null, null, function () {
            a.text(b).transition({
                opacity: 1
            }, 400)
        }), !0;
        a.effect("pulsate", {
            times: 1
        });
        return !1
    },
        m = function (a, b) {
            var c = GameManager.company,
                d = c.currentGame,
                c = c.staff.first(function (a) {
                    return a.name == b
                });
            d.flags.featureResponsibility[a.id] = c ? c.id : null
        },
        l = function (a, b) {
            var c = GameManager.company,
                d = c.currentGame.flags.featureResponsibility,
                f = !1;
            if (d.hasOwnProperty(b.id)) {
                var g =
                    d[b.id];
                if (c = c.staff.first(function (a) {
                    return a.id === g
                })) a.text(c.name).css("opacity", 1), f = !0
            }
            f || a.text("Drag staff here".localize()).css("opacity", 1).delay(800).queue(function () {
                $(this).effect("pulsate", {
                    times: 1
                });
                $(this).dequeue()
            })
        };
    UI._updateStaffListForFeatures = function () {
        var a = GameManager.company,
            b = $(".simplemodal-data"),
            c = b.find(".staffListContainer");
        c.empty();
        for (var a = a.staff, d = 0; d < a.length; d++) {
            var g = a[d],
                k, l = g;
            k = $("#staffListItemTemplate").clone();
            k.removeAttr("id");
            k.find(".staffName").text(l.name);
            if (l.flags.expert) {
                var m = "({0})".format(Missions.getMissionWithId(l.flags.expert).name),
                    n = UI._getMaxFontSize("{0}pt {1}", UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" : "Open Sans", 11, 7, 75, 50, [m]),
                    p = k.find(".specialization");
                p.text(m);
                11 > n && p.css("font-size", n + "pt")
            }
            m = Math.floor(500 * l.designFactor);
            k.find(".design").html("{0}<span>{1}</span>".format("Design: ".localize(), m));
            l = Math.floor(500 * l.technologyFactor);
            k.find(".technology").html("{0}<span>{1}</span>".format("Tech.: ".localize(), l));
            n = UI._getMaxFontSize("bold {0}pt {1}",
                UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" : "Open Sans", 11, 7, 75, 50, ["Design: ".localize(), "Tech.: ".localize()]);
            11 > n && k.css("font-size", n + "pt");
            k.draggable({
                helper: "clone",
                zIndex: 7E3,
                appendTo: b
            });
            f.push({
                staffName: g.name,
                element: k,
                workLoadElement: k.find(".workload"),
                captionElement: k.find(".responsibility")
            });
            c.append(k)
        }
    };
    var g = [];
    GameManager.addTickListener(function () {
        if (0 != g.length) {
            for (var a = 0; a < g.length; a++) {
                var b = g[a],
                    c = {};
                b.width && (c.width = b.width);
                b.background && (c.background = b.background);
                b.css(c);
                b.textValue && b.text(b.textValue)
            }
            g = []
        }
    }, !1);
    UI._updateFeatureFocusPreview = function () {
        for (var b = UI._getSelectedFeaturePercentages(), d = 0; d < a.length; d++) {
            var f = a[d];
            f.width && (f.width = b[d] / 100 * c + "px");
            g.push(f)
        }
        GameManager.company.currentGame.isStaffResponsibilityEnabled() && n(b);
        r(b)
    };
    var n = function (a, b) {
        a || (a = UI._getSelectedFeaturePercentages());
        var c = GameManager.company,
            d = c.currentGame;
        if (d.isStaffResponsibilityEnabled()) {
            for (var k = {}, l = 0; l < c.staff.length; l++) {
                var m = c.staff[l];
                m.flags.workload || (m.flags.workload =
                    0);
                for (var n = k[m.id] ? workloads[m.id] : m.flags.workload, p = 0; p < UI.selectedFeatures.length; p++) {
                    var r = d.flags.featureResponsibility[UI.selectedFeatures[p].id];
                    void 0 !== r && r === m.id && (n += a[p])
                }
                k[m.id] = n;
                n *= 100 / (300 / General.getOptimalTeamSize(d));
                p = f.first(function (a) {
                    return a.staffName == m.name
                });
                r = p.workLoadElement;
                r.width = n.clamp(0, 100) + "%";
                var w = ((n - 100) / 50).clamp(0, 1);
                r.background = createjs.Graphics.getHSL(120 - 120 * w, 100, 60, 0.5); - 1 == g.indexOf(r) && g.push(r);
                p.captionElement.textValue = "{0}%".format(Math.round(n)); -
                    1 == g.indexOf(p.captionElement) && g.push(p.captionElement)
            }
            if (b)
                for (l = 0; l < c.staff.length; l++) m = c.staff[l], k.hasOwnProperty(m.id) && (m.flags.workload = k[m.id])
        }
    },
        r = function (a) {
            for (var b = UI._getSelectedFeatures(), c = 0; c < UI.selectedFeatures.length; c++) {
                var f = UI.selectedFeatures[c],
                    k = UI.selectedFeatures[c].id,
                    l = b.filter(function (a) {
                        return a.category === k
                    }),
                    m = General.getFeatureEfficiencyFromMissionFocus(GameManager.company.currentGame, l, a[c]),
                    m = Math.round(m);
                if (l = d.first(function (a) {
                    return a.missionId === f.id
                })) m =
                    100 === m ? f.name : "{0} ({1}%)".format(f.name, Math.round(m)), l.textValue != m && (l.textValue = m, -1 == g.indexOf(l) && g.push(l))
            }
        };
    UI._getSelectedFeaturePercentages = function () {
        var a = UI._getSelectedSliderValues(),
            b = a.sum();
        return 0 == b ? [100 / 3, 100 / 3, 100 / 3] : a.map(function (a) {
            return a / (b / 70) + 10
        })
    };
    UI._getSelectedSliderValues = function () {
        return b.map(function (a) {
            return a.value
        })
    };
    var p = function () {
        var a = $(".simplemodal-data"),
            b = [],
            c = GameManager.company;
        a.find(".focusSliderStaffName").each(function (a, d) {
            var f = $(d),
                g =
                    f.text();
            c.staff.first(function (a) {
                return a.name == g
            }) || b.push(f)
        });
        return 0 < b.length ? b : !1
    };
    UI.featuresSelectedClick = function () {
        Sound.click();
        var a = GameManager.company.currentGame,
            b = $(".simplemodal-data");
        if (a.isStaffResponsibilityEnabled()) {
            var c = p();
            if (c) {
                $(c).each(function (a, b) {
                    b.effect("pulsate", {
                        times: 3
                    })
                });
                b.find(".okButton").parent().effect("shake", {
                    times: 2,
                    distance: 5
                }, 50);
                return
            }
        }
        for (var c = GameManager.getCurrentDevStage(), d = UI.getDevStageSliderValues(c), f = UI._getSelectedSliderValues(), g = 0; g <
            f.length; g++) d[g] = f[g];
        d = UI._getSelectedFeaturePercentages();
        for (g = 0; g < d.length; g++) UI.selectedFeatures[g].percentage = d[g];
        g = UI._getGameFeatureCosts();
        0 != g && GameManager.company.adjustCash(-g, "Dev. stage {0}".localize().format(c));
        var g = UI._getSelectedFeatures(),
            k = a.features.map(function (a) {
                return a.id
            });
        a.features.addRange(g.filter(function (a) {
            return -1 == k.indexOf(a.id)
        }));
        3 === c && (GameManager.uiSettings.selectedGameFeatures = a.features.map(function (a) {
            return a.id
        }));
        b.find(".featureSelectionPanel").removeClass("featureSelectionShowState").addClass("featureSelectionPanelHiddenState");
        b.find(".featureStaffAsignPanel").removeClass("showState").addClass("hidden");
        b.delay(200).queue(function () {
            UI.closeModal(function () {
                n(null, !0);
                GameManager.executeFeatures(UI.selectedFeatures)
            });
            $(this).dequeue()
        })
    }
})();
(function () {
    UI._showReleaseGame = function (a, b) {
        for (var c = GameManager.company.staff.filter(function (a) {
            return !0
        }), f = 0; f < c.length; f++) c[f].state === CharacterState.Working && (c[f].state = CharacterState.Idle, c[f].currentFeature = null), c[f].resetLeftOverPoints();
        VisualsManager.gameStatusBar.endDevelopment();
        GameManager.company.currentGame ? UI.showReleaseGameDialog({
            disableCheckForNotifications: !0,
            onClose: function () {
                Research.checkForNewResearch();
                GameManager.removeFromActiveNotifications(a);
                GameManager.notifyIdleState();
                b && b()
            }
        }) : (GameManager.resume(!0), Research.checkForNewResearch(), GameManager.removeFromActiveNotifications(a), GameManager.notifyIdleState(), b && b())
    };
    UI.showReleaseGameDialog = function (a) {
        var b = $("#releaseGameDialog"),
            c = GameManager.company.currentGame;
        b.find(".releaseGameNameDisplay").text("{0}".localize("{0} game name").format(c.title));
        b.find(".releaseGameNameInput").attr("value", "{0}".localize("{0} game name").format(c.title));
        b.find(".okButton").hide();
        b.find(".trashGameButton").unbind("click").click(UI.trashGameClick).hide();
        b.find(".releaseGameNameEditButton").unbind("click").click(UI.releaseGameNameEditButtonClick);
        b.find(".releaseGameNameEditOKButton").unbind("click").click(UI.releaseGameNameEditOKButtonClick);
        b.find(".pointsContainer").hide();
        b.find(".pointsNewRecord").hide();
        b.find(".xpTitle").hide();
        b.find(".xpBonus").hide();
        UI.showModalContent("#releaseGameDialog", {
            onOpen: function () {
                UI._startReleaseGameDialogAnimations()
            },
            onClose: a.onClose,
            disableCheckForNotifications: a.disableCheckForNotifications
        })
    };
    UI.releaseGameNameEditButtonClick =
        function () {
            var a = $(".simplemodal-data");
            a.find(".gameNameDisplay").transit({
                opacity: 0
            }, 500);
            var b = a.find(".gameNameEdit");
            b.show().css("opacity", 0).transit({
                opacity: 1
            }, 500);
            setTimeout(function () {
                b.focus()
            }, 100)
        };
    UI.releaseGameNameEditOKButtonClick = function () {
        var a = $(".simplemodal-data"),
            b = a.find(".releaseGameNameInput")[0].value;
        b && (a.find(".gameNameDisplay").transit({
            opacity: 1
        }, 500), a.find(".gameNameEdit").transit({
            opacity: 0
        }, 500, null, function () {
            a.find(".gameNameEdit").hide()
        }), a.find(".releaseGameNameDisplay").text(b),
            GameManager.company.currentGame.title != b && (GameManager.company.currentGame.flags.hasCustomName = !0), GameManager.company.currentGame.title = b)
    };
    var a = [],
        b = 1;
    GameManager.addTickListener(function (c) {
        if (a && 0 < a.length) {
            c *= b;
            for (var f = 0; f < a.length; f++) {
                var m = a[f],
                    l = m._target;
                l.klug_progress && l.progressbar({
                    value: l.klug_progress
                });
                l.css_width_percent && l.css({
                    width: l.css_width_percent + "%"
                });
                if (l.klug_int_text) {
                    var g = Math.floor(l.klug_int_text);
                    l.text(g)
                }
                l.klug_number_int_text && (g = Math.floor(l.klug_number_int_text),
                    l.text(0 == g ? g : 0 < g ? "+" + g : "-" + g));
                m.tick(c, !1)
            }
        }
    });
    var c = function () {
        b = 5
    },
        f;
    UI._startReleaseGameDialogAnimations = function () {
        var d = GameManager.gameId,
            k = GameManager.company,
            m = $(".releaseGameFeatureTemplate"),
            l = $(".simplemodal-data"),
            g = l.find(".featuresContainer");
        g.empty();
        a = [];
        b = 1;
        var n = 0,
            r = k.currentGame,
            p = r.featureLog.first().lastUpdate,
            s = new MersenneTwister(p),
            u = 0 < k.gameLog.length && !k.gameLog.some(function (a) {
                return a.technologyPoints > r.technologyPoints
            }),
            t = 0 < k.gameLog.length && !k.gameLog.some(function (a) {
                return a.designPoints >
                    r.designPoints
            }),
            p = l.find(".technologyPoints"),
            q = l.find(".designPoints");
        p.klug_int_text = 0;
        q.klug_int_text = 0;
        a.push(createjs.Tween.get(p).wait(200).call(function () {
            $(window).on("click", c)
        }));
        Sound.playSoundLoop("pointCount", 1);
        var v = createjs.Tween.get(p).to({
            klug_int_text: r.technologyPoints
        }, 1800).call(function () {
            u && d == GameManager.gameId && (Sound.playSoundOnce("newRecord", 0.7), UI.maxFont("bold", l.find(".technologyPointsNewRecord"), 16), l.find(".technologyPointsNewRecord").fadeIn().effect("pulsate", {
                times: 3
            }), l.find(".pointDisplayContainer").transition({
                height: 120
            }), l.find(".featuresContainer").transition({
                height: 250
            }))
        });
        a.push(v);
        v = createjs.Tween.get(q).to({
            klug_int_text: r.designPoints
        }, 1800).call(function () {
            if (t) {
                if (d != GameManager.gameId) return;
                Sound.playSoundOnce("newRecord", 0.7);
                UI.maxFont("bold", l.find(".designPointsNewRecord"), 16);
                l.find(".designPointsNewRecord").fadeIn().effect("pulsate", {
                    times: 3
                });
                l.find(".pointDisplayContainer").transition({
                    height: 120
                });
                l.find(".featuresContainer").transition({
                    height: 250
                })
            }
            Sound.stopSound("pointCount")
        });
        a.push(v);
        n += 1800;
        q = [];
        r.flags.isNewTopic && q.push({
            bonus: 0.2,
            label: "New Topic".localize()
        });
        r.flags.isNewCombination && q.push({
            bonus: 0.3,
            label: "New Combo".localize()
        });
        r.isStaffResponsibilityEnabled() && (k.staff.count(function (a) {
            return r.getRatioWorked(a) && 101 <= General.getEffectiveWorkload(a, r)
        }) || q.push({
            bonus: 0.3,
            label: "Good Management".localize()
        }));
        var A = 1 + q.sum(function (a) {
            return a.bonus
        }),
            z = "",
            B = l.find(".xpBonusModifier").hide();
        if (1 != A) {
            for (var D = 1, v = createjs.Tween.get(B).wait(n), p = 0; p < q.length; p++)(function (a,
                b) {
                v = v.wait(1200 * b).call(function () {
                    d == GameManager.gameId && (D += a.bonus, 0 != b && (z += ", "), z += a.label, B.text("(Bonus: x{0} - {1})".localize("{0} bonusMultiplier, {1} label").format(Math.roundToDecimals(D, 2), z)), B.effect("pulsate", {
                        times: 2
                    }))
                })
            })(q[p], p), n += 1200;
            a.push(v)
        }
        p = General.getGameSizeDurationFactor(r.gameSize);
        1 < p && (p *= 0.7);
        for (var A = A * p, E = [], w = r.features, p = 0; p < r.featureLog.length; p++) {
            var F = r.featureLog[p];
            if ("mission" == F.missionType) {
                var C = General.getMission(F.id),
                    J = C.percentage ? C.percentage /
                        100 : 1,
                    q = (150 + 45 * s.random()) * A,
                    q = 0.3 * q + 0.7 * q * J,
                    q = 0.75 * q,
                    q = {
                        originalItem: C,
                        name: C.name,
                        level: LevelCalculator.getLevel(C.experience),
                        progress: LevelCalculator.getProgressToNextLevel(C.experience),
                        xpGain: q,
                        progressColor: "orange",
                        progressGainColor: "#FFC456",
                        cssClass: "gameFeatureXPBar"
                    };
                q.newLevel = LevelCalculator.getLevel(C.experience + q.xpGain);
                q.progressGain = LevelCalculator.getProgressToLevel(q.level + 1, C.experience + q.xpGain) - q.progress;
                E.push(q);
                for (var K = w.filter(function (a) {
                    return a.showXPGain && a.category ===
                        F.id
                }), L = 0; L < K.length; L++) C = General.getFeature(K[L].id), q = (270 + 81 * s.random()) * A, q = 0.3 * q + 0.7 * q * J, q *= 0.75, q = {
                    originalItem: C,
                    name: C.name,
                    level: LevelCalculator.getLevel(C.experience),
                    progress: LevelCalculator.getProgressToNextLevel(C.experience),
                    xpGain: q,
                    progressColor: "#00BFFF",
                    progressGainColor: "#8CE2FF",
                    cssClass: "relatedGameFeatureXPBar"
                }, q.newLevel = LevelCalculator.getLevel(C.experience + q.xpGain), q.progressGain = LevelCalculator.getProgressToLevel(q.level + 1, C.experience + q.xpGain) - q.progress, E.push(q)
            }
        }
        if (k.flags.pirateMode)
            for (w =
                r.features.filter(function (a) {
                    return "DRM" == a.category
                }), p = 0; p < w.length; p++) C = w[p], q = (270 + 81 * s.random()) * A, q = 0.4 * q + 0.4 * q * s.random(), q *= 0.75, q = {
                    originalItem: C,
                    name: C.name,
                    level: LevelCalculator.getLevel(C.experience),
                    progress: LevelCalculator.getProgressToNextLevel(C.experience),
                    xpGain: q,
                    progressColor: "#404040",
                    progressGainColor: "gray",
                    cssClass: "drmTechXPBar"
                }, q.newLevel = LevelCalculator.getLevel(C.experience + q.xpGain), q.progressGain = LevelCalculator.getProgressToLevel(q.level + 1, C.experience + q.xpGain) -
                q.progress, E.push(q);
        for (var H = [], G = [], p = 0; p < k.staff.length; p++) q = k.staff[p], r.getRatioWorked(q) && function (a) {
            var b = a.experience,
                c = LevelCalculator.getLevel(b),
                d = (80 + 32 * s.random()) * A,
                f = r.getRatioWorked(a),
                d = d * f.clamp(0, 1),
                d = 0.75 * d,
                f = General.getEffectiveWorkload(a, r);
            void 0 != f && (isNaN(f) ? d *= 0.1 : (f = 0.5 * (1 - 1 * (Math.abs(f - 100) / 100)).clamp(0, 1), d += d * f));
            f = {
                originalItem: a,
                name: a.name,
                level: c,
                progress: LevelCalculator.getProgressToNextLevel(b),
                xpGain: d,
                newLevel: LevelCalculator.getLevel(b + d),
                progressColor: "firebrick",
                progressGainColor: "red",
                cssClass: "staffXPBar",
                apply: function () {
                    a.experience += d;
                    var b = LevelCalculator.getLevel(a.experience);
                    if (b != c) {
                        a.qualityFactor = b / 5;
                        if (0 != a.id) {
                            var f = (b - c) * Character.BASE_SALARY_PER_LEVEL,
                                f = f + 0.4 * f * k.getRandom(),
                                f = 1E3 * Math.floor(f / 1E3);
                            a.salary += f;
                            H.push({
                                staff: a,
                                value: f
                            })
                        }
                        5 == b && (Tutorial.staffReachedLvl5(), -1 == G.indexOf(a) && G.push(a))
                    }
                }
            };
            f.progressGain = LevelCalculator.getProgressToLevel(f.level + 1, b + f.xpGain) - f.progress;
            E.push(f)
        }(q);
        C = 14;
        q = "{0}pt {1}";
        w = UI.IS_SEGOE_UI_INSTALLED ?
            "Segoe UI" : "Open Sans";
        1 < E.count(function (a) {
            return a.level < a.newLevel
        }) && (q = "bold {0}pt {1}", C = UI._getMaxFontSize(q, w, C, 8, 130, 20, ["Level Up!".localize()]));
        J = [];
        K = [];
        for (p = 0; p < E.length; p++) {
            J.push(E[p].name);
            var I = "Lvl. ".localize() + E[p].level;
            0 == K.count(function (a) {
                return a == I
            }) && K.push(I)
        }
        C = UI._getMaxFontSize(q, w, C, 8, 195, 20, J);
        C = UI._getMaxFontSize(q, w, C, 8, 53, 20, K);
        14 == C && (C = void 0);
        for (p = 0; p < E.length; p++) w = m.clone(), void 0 != C && w.css("font-size", C + "pt"), q = E[p],
            function (b, c) {
                b.find(".featureName").text(c.name);
                b.find(".featureLevel").text("Lvl. ".localize() + c.level);
                var f = b.find(".featureLevelUp");
                f.hide();
                b.find(".featureProgress").css({
                    width: c.progress - 1 + "%"
                }).css({
                    "background-color": c.progressColor
                });
                var k = b.find(".featureProgressGain").css({
                    "background-color": c.progressGainColor
                });
                k.css_width_percent = 0;
                var l = b.find(".featureGainCaption");
                l.klug_number_int_text = 0;
                c.cssClass && b.addClass(c.cssClass);
                b.hide();
                v = createjs.Tween.get(b).wait(n).call(function () {
                    d == GameManager.gameId && (g.append(b), Sound.playSoundOnce("tack",
                        0.2), b.slideDown("normal"), g.stop().animate({
                            scrollTop: b.offset().top
                        }, 600))
                });
                a.push(v);
                v = createjs.Tween.get(k).wait(n).to({
                    css_width_percent: c.progressGain
                }, 800);
                a.push(v);
                v = createjs.Tween.get(l).wait(n).to({
                    klug_number_int_text: c.xpGain
                }, 800);
                a.push(v);
                c.newLevel != c.level && (v = createjs.Tween.get(f).wait(n + 800).call(function () {
                    d == GameManager.gameId && (f.show("slow"), Sound.playSoundOnce("levelUp", 0.4), b.find(".featureLevel").text("Lvl. ".localize() + c.newLevel), b.css("font-weight", "bold"))
                }), a.push(v));
                n += 1200
            }(w, q);
        f = function () {
            for (var a = 0; a < E.length; a++) {
                var b = E[a];
                b.apply ? b.apply() : E[a].originalItem.experience += E[a].xpGain
            }
        };
        m = createjs.Tween.get(g).wait(n).call(function () {
            UI.createDraggable(g);
            l.find(".okButton").slideDown("fast").click(function () {
                Sound.click();
                f && (f(), f = null);
                if (0 < H.length) {
                    for (var a = "Due to increase in experience the following staff have earned a raise:".localize() + "\n", b = 0; b < H.length; b++) var c = H[b],
                        d = c.staff,
                        a = a + "{0}{1}: {2} + {3} = {4}".format(4 == b ? "{n}" : "\n", d.name, UI.getShortNumberString(d.salary -
                            c.value), UI.getShortNumberString(c.value), UI.getShortNumberString(d.salary));
                    k.notifications.push(new Notification("Salary increase".localize("heading"), a, {
                        type: NotificationType.AutoPopup
                    }))
                }
                if (0 < G.length) {
                    a = "Special training available for:".localize() + "\n";
                    for (b = 0; b < G.length; b++) c = G[b], a += "{0}{1}".format(4 == b ? "{n}" : "\n", c.name);
                    k.notifications.push(new Notification("Special training".localize("heading"), a, {
                        type: NotificationType.AutoPopup
                    }))
                }
                UI.closeModal();
                General.releaseGame(GameManager.company);
                GameManager.autoSave()
            });
            l.find(".trashGameButton").fadeIn();
            $(window).off("click", c);
            a = [];
            b = 1
        });
        a.push(m)
    };
    UI.trashGameClick = function () {
        Sound.click();
        var a = $("#trashGameConfirmationDialog");
        a.find(".cancelActionButton").clickExclOnce(function () {
            Sound.click();
            a.dialog("close")
        });
        a.find(".confirmActionButton").clickExclOnce(function () {
            Sound.click();
            f && (f(), f = null);
            a.dialog("close");
            UI.closeModal(function () {
                General.trashGame(GameManager.company)
            })
        });
        a.gdDialog({
            popout: !0,
            close: !0
        })
    }
})();
(function () {
    var c = function (a, b, d, f, g) {
        var k = {};
        if ("auto" == a) DataStore.loadSlotAsync(a, function (a) {
            a = JSON.parse(a).slot;
            "auto" == a ? g("not supported") : c(a, b, d, f, g)
        }, g);
        else {
            var l = d;
            l || (l = SaveMismatchStrategy.UseLocal);
            var m = function (b) {
                5 <= b ? f(k) : n(a + "L" + b, b, l)
            },
                n = function (a, c, d) {
                    DataStore.loadSlotAsync(a, function (a) {
                        if (a) {
                            var d = JSON.parse(a);
                            if (!d || !d.company || d.company.uid != b) {
                                m(++c);
                                return
                            }
                        }
                        a && "" != a && (k["L" + c.toString()] =
                            a);
                        m(++c)
                    }, function () {
                        m(++c)
                    }, {
                        mismatchStrategy: d
                    })
                };
            m(1)
        }
    }
    UI.showSaveSlotContextMenu = function (a, b, c) {
        var d = [];
        c && "auto" != b && d.push({
            label: "Delete".localize("menu item"),
            icon: "./images/context menu icons/icon_save_delete.svg",
            action: function () {
                Sound.click();
                UI.deleteSaveSlot(b)
            }
        });
        UI.showContextMenu(d, {
            x: a.clientX,
            y: a.clientY
        }, {
            position: "rightStack"
        })
    };
})();
(function () {
    var a = "Company Name".localize(),
        b = void 0,
        c = void 0,
        f = void 0,
        d = void 0,
        k = void 0;
    UI.showNewGameView = function (c, d) {
        PlatformShim.execUnsafeLocalFunction(function () {
            $.modal.impl.o && ($.modal.impl.o.onClose = null);
            $.modal.close()
        });
        void 0 == b && (g(), l(), m());
        var f = $("#newGameViewContent");
        f.empty();
        var k = $("#newGameViewTemplate").clone();
        k.find("#companyName").attr("value", a);
        var n = PlatformShim.getUserName();
        n || (n = "Player Name".localize());
        k.find("#playerName").attr("value", n);
        k.find(".characterSexSelectionButton").toggleClass("selected",
            !1);
        b ? k.find(".characterSexSelectionButton.maleSex").toggleClass("selected", !0) : k.find(".characterSexSelectionButton.femaleSex").toggleClass("selected", !0);
        f.append(k);
        UI.closeAllLoadSaveViews();
        var f = $("#newGameView"),
            q = f.find(".featureSelectionPanel");
        f.find(".configButton").clickExcl(function () {
            Sound.click();
            q.hasClass("featureSelectionPanelHiddenState") ? q.removeClass("featureSelectionPanelHiddenState").addClass("featureSelectionShowState") : q.removeClass("featureSelectionShowState").addClass("featureSelectionPanelHiddenState")
        });
        UI.showModalContent("#newGameView", {
            disableCheckForNotifications: !0,
            onClose: function () {
                GameManager.company.activeNotifications.remove(c);
                d && d()
            },
            onOpen: function () {
                UI._updatePreview();
                var a = $("#canvasScrollContainer").width(),
                    b = $("#simplemodal-container");
                b.removeClass("smallScreenPopup");
                1024 >= a && b.addClass("smallScreenPopup");
                UI.maxFont(void 0, b.find(".featureSelectionPanel").find(".smallerWindowTitle"), 22)
            }
        })
    };
    UI._updatePreview = function () {
        var a = $(".simplemodal-data").find(".characterPreviewCanvas")[0];
        a.height = 254;
        a.width = 360;
        a = a.getContext("2d");
        a.drawImage(GameDev.ResourceManager.resources[ResourceKeys.PreviewDesk], 0, 0, 360, 254);
        a.drawImage(UI._getChair(), 122, 22, 200, 200);
        a.drawImage(UI._getPants(), 122, 22, 200, 200);
        a.drawImage(UI._getHands(), 122, 22, 200, 200);
        a.drawImage(UI._getBody(), 122, 22, 200, 200);
        a.drawImage(UI._getHead(), 122, 22, 200, 200)
    };
    UI._getChair = function () {
        return GameDev.ResourceManager.resources[ResourceKeys.PreviewChair]
    };
    UI._getPants = function () {
        return b ? GameDev.ResourceManager.resources[ResourceKeys.PreviewPants1] :
            GameDev.ResourceManager.resources[ResourceKeys.PreviewPants9]
    };
    UI._getHands = function () {
        return b ? 4 === f || 7 === f ? GameDev.ResourceManager.resources[ResourceKeys.PreviewHands4] : 5 === f || 8 === f ? GameDev.ResourceManager.resources[ResourceKeys.PreviewHands5] : GameDev.ResourceManager.resources[ResourceKeys.PreviewHands1] : 12 === k ? GameDev.ResourceManager.resources[ResourceKeys.PreviewHands12] : 10 === k ? GameDev.ResourceManager.resources[ResourceKeys.PreviewHands10] : GameDev.ResourceManager.resources[ResourceKeys.PreviewHands9]
    };
    UI._getBody = function () {
        return b ? GameDev.ResourceManager.resources[ResourceKeys["PreviewBody" + c]] : GameDev.ResourceManager.resources[ResourceKeys["PreviewBody" + d]]
    };
    UI._getHead = function () {
        return b ? GameDev.ResourceManager.resources[ResourceKeys["PreviewHead" + f]] : GameDev.ResourceManager.resources[ResourceKeys["PreviewHead" + k]]
    };
    var m = function () {
        (b = 1 == Math.randomSign()) ? l() : g()
    },
        l = function () {
            b = !0;
            c = [1, 2, 3, 4, 5, 6, 7, 8].pickRandom();
            f = [1, 4, 7, 5, 8].pickRandom()
        },
        g = function () {
            b = !1;
            d = [9, 10, 11, 12].pickRandom();
            k = [12, 10, 9].pickRandom()
        };
    UI.selectSexClicked = function (a) {
        Sound.click();
        "random" == a ? m() : b = "male" === a;
        b ? ($(".femaleSex").removeClass("selected"), $(".maleSex").removeClass("selected").addClass("selected")) : ($(".maleSex").removeClass("selected"), $(".femaleSex").removeClass("selected").addClass("selected"));
        UI._updatePreview()
    };
    UI.nextBody = function () {
        Sound.click();
        b ? (c += 1, 9 === c && (c = 1)) : (d += 1, 13 === d && (d = 9));
        UI._updatePreview()
    };
    UI.prevBody = function () {
        Sound.click();
        b ? (c -= 1, 0 === c && (c = 8)) : (d -= 1, 8 === d && (d =
            12));
        UI._updatePreview()
    };
    UI.nextHead = function () {
        Sound.click();
        b ? (f += 1, 9 === f && (f = 1)) : (k += 1, 13 === k && (k = 9));
        UI._updatePreview()
    };
    UI.prevHead = function () {
        Sound.click();
        b ? (f -= 1, 0 === f && (f = 8)) : (k -= 1, 8 === k && (k = 12));
        UI._updatePreview()
    };
    UI.closeNewGameView = function () {
        if (!Knowledge.isPlayerKnowledgeAvailable() || GameManager.useKnowledgeAnswered) {
            GameManager.useKnowledgeAnswered || Sound.click();
            GameManager.state = State.Idle;
            $("#mainBackground").fadeIn();
            $("foregroundCanvas").fadeIn();
            var g = $(".simplemodal-data"),
                l = GameManager.company;
            l.name = g.find("#companyName")[0].value;
            l.flags.hasCustomName = l.name != a;
            l.staff[0].name = g.find("#playerName")[0].value;
            l.staff[0].sex = b ? "male" : "female";
            l.staff[0].flags.body = b ? c : d;
            l.staff[0].flags.head = b ? f : k;
            GameManager.flags.gameLengthModifier = parseFloat(g.find("#gameLengthSelection").val());
            l.flags.pirateMode = "on" === g.find("#pirateModeSelection").val();
            GameManager.openSaveView();
            VisualsManager.resetAllCharacters();
            for (g = 0; g < l.staff.length; g++) l.staff[g].startAnimations();
            UI.closeModal()
        } else Sound.click(),
            UI.showUseKnowledgeFromPrevGameDialog()
    };
    UI.showUseKnowledgeFromPrevGameDialog = function () {
        var a = "Since you have played the game before you can choose to use all previously gained hints in this new game.".localize(),
            a = a + ("<br/><br/>" + "Would you like to import all previously gained hints into this game?".localize());
        $("#useKnowledgeFromPreviousGameDialog").find(".useKnowledgeFromPreviousGameMessage").html(PlatformShim.toStaticHtml(a));
        $("#useKnowledgeFromPreviousGameDialog").dialog({
            draggable: !1,
            modal: !0,
            resizable: !1,
            show: "fade",
            zIndex: 5E3,
            open: function () {
                $(this).siblings(".ui-dialog-titlebar").remove();
                $(this).find(".cancelActionButton").clickExclOnce(function () {
                    Sound.click();
                    $("#useKnowledgeFromPreviousGameDialog").dialog("close");
                    GameManager.useKnowledgeAnswered = !0;
                    UI.closeNewGameView()
                });
                $(this).find(".confirmActionButton").clickExclOnce(function () {
                    Sound.click();
                    $("#useKnowledgeFromPreviousGameDialog").dialog("close");
                    Knowledge.usePlayerKnowledge(GameManager.company);
                    GameManager.useKnowledgeAnswered = !0;
                    UI.closeNewGameView()
                });
                UI.maxFont("bolder", $(this).find(".windowTitle"), 34)
            }
        })
    };
    UI._getElementForSaveGame = function (a, b) {
        var c = $("#loadSaveButtonTemplate").clone();
        c.addClass("load");
        if (!a) return c;
        if (void 0 != a.currentWeek) {
            var d = b.getDate(a.currentWeek);
            if (a.saveTime) {
                var f = $.timeago(a.saveTime);
                c.find(".saveTime").text(f).css("font-size", UI._getMaxFontSizeSimple(f, 12, 182, 33))
            }
        }
        "auto" == a.slot ? c.find(".slot").text("Auto".localize()) : c.find(".slot").text("Slot ".localize() + a.slot);
        c.find(".name").text(a.companyName);
        a.pirateMode && c.find(".pirateModeImage").show();
        f = c.find(".cash").text(UI.getShortNumberString(a.cash));
        0 > a.cash ? f.addClass("red") : f.addClass("green");
        void 0 != a.fans && c.find(".fans").text(UI.getShortNumberString(a.fans) + " fans".localize());
        void 0 != d && c.find(".week").text("Y{0} M{1} W{2}".localize("date display").format(d.year, d.month, d.week));
        if (!PlatformShim.ISWIN8)
            if (a.mods && 0 < a.mods.length) {
                var g = ModSupport.currentMods,
                    k = a.mods.length,
                    l = c.find(".mods");
                l.find(".listTitle").html("Mods: ".localize());
                a.mods.forEach(function (a, b) {
                    if ("gdt-modAPI" != a.id) {
                        var c = $("<span>").clone(),
                            d = "{0} - {1}({2}) {3}".format(a.name, a.author, a.id, "Version: ".localize() + a.version),
                            f = g.first(function (b) {
                                return b === a.id
                            }) ? "green" : "red";
                        c.addClass(f);
                        c.append(a.name);
                        c.attr("title", d);
                        l.append(c);
                        k == b + 1 ? l.append(".") : l.append(", ")
                    }
                })
            } else c.find(".mods").hide();
        return c
    };
    UI.closeAllLoadSaveViews = function () {
        $("#loadView").dialog("close");
        $("#saveView").dialog("close");
        $("#newGameView").dialog("close");
        $("#overwriteGameDialog").dialog("close");
        $("#createShareCodeWindow").dialog("close");
        UI.closeContextMenu()
    };
    UI.showLoadView = function (a) {
        var b = $("#loadViewContent");
        b.empty();
        for (var c = new Company("x"), d = 0; d < a.length; d++) {
            var f = a[d],
                g = UI._getElementForSaveGame(f, c);
            b.append(g);
            var k = g.get(0);
            k.saveGame = f;
            k.onclick = function () {
                Sound.click();
                this.saveGame && GameManager.reload(this.saveGame.slot, function () {
                    Sound.playBackgroundMusic()
                })
            };
            k.saveGame ? f = k.saveGame.slot : (f = d) && "auto" != a[0].slot && f++;
            (function (a, b) {
                g.find(".saveSlotOptions").clickExcl(function (c) {
                    Sound.click();
                    c.stopPropagation();
                    UI.showSaveSlotContextMenu(c, a, b)
                })
            })(f, k.saveGame)
        }
        UI.closeAllLoadSaveViews();
        GameManager.pause(!0);
        GameManager.loadScreenOpened = !0;
        $("#loadView").dialog({
            width: 670,
            draggable: !1,
            modal: !0,
            resizable: !1,
            show: "fade",
            zIndex: 6800,
            open: function () {
                var a = $(UI.closeButtonTemplate);
                a.zIndex = 6900;
                a.clickExclOnce(function () {
                    Sound.click();
                    $("#loadView").dialog("close");
                    UI.closeContextMenu();
                    GameManager.resume(!0)
                });
                $(this).find(".windowTitle").css({
                    margin: "5px 50px 5px 65px"
                });
                $(this).parents(".ui-dialog:first").append(a);
                $(this).siblings(".ui-dialog-titlebar").remove();
                $(this).parents(".ui-dialog:first").addClass("tallWindow");
                $(this).parents(".ui-dialog:first").addClass("windowBorder");
                $(this).parents(".ui-dialog:first").removeClass("ui-widget-content")
            },
            close: function () {
                $(this).dialog("destroy");
                this.style.cssText = "display:none;";
                GameManager.resume(!0)
            }
        })
    };
    UI.deleteSaveSlot = function (a) {
        $("#deleteGameDialog").dialog({
            draggable: !1,
            modal: !0,
            resizable: !1,
            show: "fade",
            zIndex: 7E3,
            title: "Attention",
            open: function () {
                $(this).siblings(".ui-dialog-titlebar").remove();
                $(this).find(".cancelActionButton").clickExclOnce(function () {
                    Sound.click();
                    $("#deleteGameDialog").dialog("close")
                });
                $(this).find(".confirmActionButton").clickExclOnce(function () {
                    Sound.click();
                    $("#deleteGameDialog").dialog("close");
                    DataStore.setValue(a, null);
                    DataStore.saveToSlotAsync(a, "");
                    for (var b = 1; 4 >= b; b++) DataStore.saveToSlotAsync(a + "L" + b.toString(), "");
                    DataStore.commit && DataStore.commit();
                    UI.closeAllLoadSaveViews()
                })
            },
            close: function () {
                $(this).dialog("destroy");
                this.style.cssText = "display:none;"
            }
        })
    };
    var n = 0;
    UI.showSaveView = function (a) {
        var b = $("#saveViewContent");
        b.empty();
        $("#loadSaveButtonTemplate").get(0);
        for (var c = new Company("x"), d = 1; 5 >= d; d++) {
            for (var f = null, g = 0; g < a.length; g++) {
                var k = a[g];
                if (k && k.slot == d) {
                    f = a[g];
                    break
                }
            }
            g = null;
            if (f) g = UI._getElementForSaveGame(f, c), g.find(".saveSlotOptions").hide();
            else {
                GameManager.company.slot = d;
                GameManager.save(GameManager.company.slot);
                GameManager.save(GameManager.company.slot + "L1");
                return
            }
            b.append(g);
            g = g.get(0);
            g.saveGame = f;
            g.onclick = function () {
                Sound.click();
                n = this.saveGame.slot;
                UI.showOverwriteView()
            }
        }
        UI.closeAllLoadSaveViews();
        $("#saveView").dialog({
            width: 630,
            draggable: !1,
            modal: !0,
            resizable: !1,
            show: "fade",
            zIndex: 6E3,
            open: function () {
                var a = $(this).find(".windowTitle");
                UI.maxFont("bolder", a, 35);
                a = $(UI.closeButtonTemplate);
                a.zIndex = 6200;
                a.clickExclOnce(function () {
                    Sound.click();
                    $("#saveView").dialog("close")
                });
                $(this).parents(".ui-dialog").append(a);
                $(this).siblings(".ui-dialog-titlebar").remove();
                $(this).parents(".ui-dialog:first").addClass("tallWindow");
                $(this).parents(".ui-dialog:first").addClass("windowBorder");
                $(this).parents(".ui-dialog:first").removeClass("ui-widget-content")
            },
            close: function () {
                $(this).dialog("destroy");
                this.style.cssText = "display:none;";
                GameManager.company.slot ? GameManager.resume(!0) : GameManager.startNewGame()
            }
        })
    };
    UI.showOverwriteView = function () {
        $("#overwriteGameDialog").dialog({
            draggable: !1,
            modal: !0,
            resizable: !1,
            show: "fade",
            zIndex: 7E3,
            title: "Attention",
            open: function () {
                $(this).siblings(".ui-dialog-titlebar").remove();
                $(this).find(".cancelActionButton").clickExclOnce(function () {
                    Sound.click();
                    $("#overwriteGameDialog").dialog("close")
                });
                $(this).find(".confirmActionButton").clickExclOnce(function () {
                    Sound.click();
                    GameManager.company.slot = n;
                    $("#overwriteGameDialog").dialog("close");
                    $("#saveView").dialog("close");
                    $("#splashProgress").fadeOut();
                    GameManager.save(GameManager.company.slot);
                    GameManager.save(GameManager.company.slot + "L1");
                    GameManager.resume(!0)
                })
            },
            close: function () {
                $(this).dialog("destroy");
                this.style.cssText = "display:none;"
            }
        })
    }
})();
(function () {
    var a = [];
    UI.addSalesCard = function (d, l, g, n, r, p, s, u, t, q, v, A) {
        g < n && 0 < g && 0 === s.length && s.push(g);
        1 === s.length ? (d = b(d, l, p, r), l = f(t != Sales.consoleUnitPrice), d.stage.addChild(l), l.y = 51, l.width = 223, d.shapes = [l], a.push(d), g = 1 - (GameManager.company.currentWeek - Math.floor(GameManager.company.currentWeek)), k.push(createjs.Tween.get(l).to({
            y: 0,
            height: 51
        }, 7500 * g)), g = r, u ? (g = A ? r + u / A / t : r + u / t, k.push(createjs.Tween.get(d).wait(500).to({
            unitsSold: g
        }, 7500))) : k.push(createjs.Tween.get(d).wait(500).to({
            unitsSold: r
        },
            7500)), q && (l = f("maintenance"), d.stage.addChild(l), l.y = 51, l.width = 223, d.maintenanceShapes = [l], k.push(createjs.Tween.get(l).to({
                y: 51 - q / t / g * 51,
                height: q / t / g * 51
            }, 7500)))) : 1 < s.length && c(d, l, p, r, s, t, v, A)
    };
    var b = function (a, b, c, f) {
        var k = $("#gameSalesContainer"),
            p = $("#gameSalesCardTemplate").clone();
        p.removeAttr("id");
        p.rankElement = p.find(".gameSalesRankLabel");
        p.unitsElement = p.find(".gameSalesUnitsLabel");
        p.find(".gameNameLabel").text(b);
        d(p, c, f, {
            currentRankText: "",
            currentUnitsText: ""
        });
        k.append(p);
        b = p.find(".gameSalesCardCanvas");
        b = new createjs.Stage(b[0]);
        b.canvas.height = 51;
        b.canvas.width = 223;
        p.on("click", function (b) {
            UI.salesContainerClick(b, a)
        });
        return {
            id: a,
            stage: b,
            card: p,
            currentSalesRank: c,
            unitsSold: f
        }
    },
        c = function (c, d, g, k, r, p, s, u) {
            c = b(c, d, g, k);
            40 <= r.length && (stageObject.stage.removeChild(stageObject.shapes[0]), stageObject.shapes.remove(stageObject.shapes[0]), r.splice(0, 1), s && (stageObject.stage.removeChild(stageObject.maintenanceShapes[0]), stageObject.maintenanceShapes.remove(stageObject.maintenanceShapes[0]), s.splice(0,
                1)));
            d = r.max(function (a) {
                return a
            });
            g = r.length;
            k = [];
            c.maintenanceShapes = [];
            if (s)
                for (u = 0; u < g; u++) {
                    var t = p != Sales.consoleUnitPrice,
                        t = f(t);
                    t.scaleX = 1 / g - 0.01;
                    t.x = 223 / g * u;
                    var q = r[u] / d * 51;
                    t.y = 51 - q;
                    t.scaleY = q / 51;
                    k.push(t);
                    var v = f("maintenance");
                    v.scaleX = 1 / g - 0.01;
                    v.x = 223 / g * u;
                    q = s[u] / p / d * 51;
                    v.y = 51 - q;
                    v.scaleY = q / 51;
                    c.maintenanceShapes.push(v);
                    r[u] > s[u] ? (c.stage.addChild(t), c.stage.addChild(v)) : (c.stage.addChild(v), c.stage.addChild(t))
                } else
                for (u = 0; u < g; u++) t = p != Sales.consoleUnitPrice, t = f(t), c.stage.addChild(t),
                    t.scaleX = 1 / g - 0.01, t.x = 223 / g * u, q = r[u] / d * 51, t.y = 51 - q, t.scaleY = q / 51, k.push(t);
            c.stage.update();
            c.shapes = k;
            a.push(c)
        },
        f = function (a) {
            var b = new createjs.Shape;
            b.alpha = 1;
            b.x = 0;
            var c = b.graphics;
            "maintenance" === a ? c.beginFill(createjs.Graphics.getRGB(255, 0, 0, 1)) : a ? c.beginFill(createjs.Graphics.getRGB(86, 216, 86, 1)) : c.beginFill(createjs.Graphics.getRGB(0, 191, 255, 1));
            c.drawRect(0, 0, 223, 51);
            c.closePath();
            return b
        },
        d = function (a, b, c, d) {
            var f = "",
                k = "";
            0 < b && (f = "Rank: ".localize() + b);
            k = "Units: ".localize() + UI.getShortNumberString(Math.floor(c));
            d.currentRankText != f && (a.rankElement.text(f), d.currentRankText = f);
            d.currentUnitsText != k && (a.unitsElement.text(k), d.currentUnitsText = k)
        };
    UI.updateSalesCard = function (b, c, d, n, r, p, s, u, t) {
        void 0 === d && (d = 0);
        if (s = a.first(function (a) {
            return a.id === b
        })) {
            s.currentSalesRank = p;
            p = s.stage;
            40 <= n.length && (s.stage.removeChild(s.shapes[0]), s.shapes.remove(s.shapes[0]), n.splice(0, 1), u && (s.stage.removeChild(s.maintenanceShapes[0]), s.maintenanceShapes.remove(s.maintenanceShapes[0]), u.splice(0, 1)));
            for (var q = n.max(function (a) {
                return a
            }),
                v = n.length, A = 223 / v, z = r != Sales.consoleUnitPrice, B = s.shapes.length, D = 0; D < B; D++) {
                var E = n[D] / q * 51,
                    w = 1 / v - 0.01;
                k.push(createjs.Tween.get(s.shapes[D]).to({
                    scaleX: w,
                    x: 223 / v * D,
                    y: 51 - E,
                    scaleY: E / 51
                }, 500))
            }
            z = f(z);
            z.y = 51;
            z.x = 223 - A;
            z.scaleX = 1 / v - 0.01;
            s.shapes.push(z);
            E = 51 * (n.last() / q);
            k.push(createjs.Tween.get(z).wait(500).to({
                y: 51 - E,
                scaleY: E / 51
            }, 7500));
            t || (t = 1);
            k.push(createjs.Tween.get(s).wait(500).to({
                unitsSold: c + d / t / r
            }, 7500));
            if (u) {
                for (D = 0; D < s.maintenanceShapes.length; D++) E = u[D] / q * 51, w = 1 / v - 0.01, k.push(createjs.Tween.get(s.maintenanceShapes[D]).to({
                    scaleX: w,
                    x: 223 / v * D,
                    y: 51 - E,
                    scaleY: E / 51
                }, 500));
                c = f("maintenance");
                c.y = 51;
                c.x = 223 - A;
                c.scaleX = 1 / v - 0.01;
                n.last() > u.last() ? (p.addChild(z), p.addChild(c)) : (p.addChild(c), p.addChild(z));
                s.maintenanceShapes.push(c);
                E = 51 * (u.last() / q);
                k.push(createjs.Tween.get(c).wait(500).to({
                    y: 51 - E,
                    scaleY: E / 51
                }, 7500))
            } else p.addChild(z)
        }
    };
    UI.clearSalesCards = function () {
        a.forEach(function (a) {
            UI.removeSalesCard(a.id, !1)
        });
        $("#gameSalesContainer").empty();
        a = []
    };
    UI.removeSalesCard = function (b, c) {
        var d = a.first(function (a) {
            return a.id === b
        });
        d && (d.card.off("click"), d.card.slideUp("slow", function () {
            $(this).remove()
        }), a.remove(d))
    };
    var k = [];
    GameManager.addTickListener(function (b, c) {
        if (k && 0 < k.length && !c) {
            for (var f = 0; f < k.length; f++) k[f].tick(b, !1);
            for (f = 0; f < a.length; f++) a[f].stage.update(), d(a[f].card, a[f].currentSalesRank, a[f].unitsSold, a[f])
        }
    }, !0)
})();
(function () {
    UI.showMarketingList = function (a, b) {
        var c = Missions.MarketingMissions;
        $(".selectionOverlayContainer").hide();
        var f = $("#marketingPicker"),
            d = {
                disableCheckForNotifications: !0,
                close: !0,
                onClose: function () {
                    GameManager.removeFromActiveNotifications(a);
                    GameManager.resume(!0);
                    b && b()
                }
            },
            k = f.find(".marketingPickerText"),
            m = GameManager.company.currentGame ? GameManager.company.currentGame.title : "";
        k.text("How do you want to market {0}?".localize().format(m));
        k = f.find(".marketingSliderContainer");
        k.empty();
        var l = $('<div class="marketingVariationContainer royalSlider rsDefaultInv"></div>');
        k.append(l);
        k = $("#genericMarketingTemplate");
        for (m = 0; m < c.length; m++) {
            var g = c[m],
                n = k.clone();
            n.find(".marketingTitle").text(g.name);
            n.find(".marketingShortTitle").text(g.shortName);
            n.find(".marketingDescription").text(g.description);
            n.find(".marketingCashCost").text("Costs: {0}".localize().format(UI.getShortNumberString(g.cost)));
            l.append(n)
        }
        PlatformShim.ISWIN8 ? l.gdSlider() : d.onOpen = function () {
            l.gdSlider()
        };
        f.find(".okButton").clickExcl(function () {
            Sound.click();
            var a = f.find(".rsActiveSlide").find(".marketingTitle").text(),
                b = Missions.MarketingMissions.first(function (b) {
                    return b.name == a
                });
            GameManager.company.cash >= b.cost ? (Missions.executePublishingMission(GameManager.company, b), UI.closeModal()) : f.find(".centeredButtonWrapper").effect("shake", {
                times: 2,
                distance: 5
            }, 50)
        });
        UI.showModalContent("#marketingPicker", d)
    }
})();
(function () {
    UI.showCreateEngineMenu = function (a, b) {
        UI.selectedEngineParts = [];
        var f = $("#createEngineMenu");
        f.find(".selectionOverlayContainer").hide();
        d();
        $(".engineTitleInput")[0].value = "Game Engine #{0}".localize("{0} is number").format(GameManager.company.engines.length + 1);
        UI.showModalContent("#createEngineMenu", {
            disableCheckForNotifications: !0,
            close: !0,
            onOpen: function () {
                c();
                UI.maxFont("bolder", f.find(".windowTitle"), 34)
            },
            onClose: function () {
                GameManager.removeFromActiveNotifications(a);
                GameManager.resume(!0);
                b && b()
            }
        })
    };
    var a = function () {
        GameManager.uiSettings.selectedEngineParts = f.map(function (a) {
            return a.id
        })
    },
        b = function (a) {
            var b = $(".simplemodal-data").find("#createEngineButton");
            a ? b.hasClass("orangeButton") || (b.removeClass("disabledButton").addClass("orangeButton"), b.clickExcl(function () {
                UI.createEngineClick()
            })) : b.hasClass("disabledButton") || b.removeClass("orangeButton").addClass("disabledButton").unbind("click")
        },
        c = function () {
            var a = f.sum(function (a) {
                return Research.getEngineCost(a)
            }),
                c = $(".simplemodal-data").find(".engineCost");
            c.text("Cost: {0}".localize().format(UI.getShortNumberString(a)));
            a > GameManager.company.cash ? (c.addClass("red"), b(!1)) : (c.removeClass("red"), b(0 < f.length))
        },
        f = [],
        d = function () {
            var a = $(".enginePartsContainer"),
                b = General.getAvailableEngineParts(GameManager.company).groupBy(function (a) {
                    return a.category
                });
            a.empty();
            var d = null;
            f = [];
            for (var g = function (a, b) {
                a.hasClass("selectedFeature") ? (a.removeClass("selectedFeature"), f.remove(b)) : ($(".simplemodal-data").find(".enginePartsContainer"), a.addClass("selectedFeature"),
                    f.push(b))
            }, n = 0; n < b.length; n++) {
                var r = b[n];
                r.category != d && (a.append($('<div class="featureSelectionCategoryHeading">{0}</div>'.format(r.categoryDisplayName))), d = r.category);
                var p = UI.generateFeatureElement(r);
                p.find(".featureContent").text("{0} ({1})".format(r.name, UI.getShortNumberString(Research.getEngineCost(r))));
                p.addClass("radioButton");
                (function (a, b) {
                    a.clickExcl(function () {
                        g(a, b);
                        c()
                    })
                })(p, r);
                GameManager.uiSettings.selectedEngineParts && -1 != GameManager.uiSettings.selectedEngineParts.indexOf(r.id) &&
                    g(p, r);
                a.append(p)
            }
            UI.createDraggable(a)
        };
    UI.createEngineClick = function () {
        UI.selectedEngineParts = f;
        a();
        if (0 !== UI.selectedEngineParts.length) {
            var b = UI.selectedEngineParts.sum(function (a) {
                return Research.getEngineCost(a)
            });
            if (!(GameManager.company.cash < b)) {
                var c = $(".simplemodal-data").find(".engineTitleInput")[0].value;
                UI.closeModal(function () {
                    GameManager.createEngine(c, UI.selectedEngineParts)
                })
            }
        }
    }
})();
(function () {
    UI.showResearchMenu = function (a, c) {
        b(a, !1, c)
    };
    UI.showTrainingMenu = function (a, c) {
        b(a, !0, c)
    };
    var a = !0,
        b = function (b, d, f) {
            a = d;
            var m = GameManager.company.staff.first(function (a) {
                return a.id === GameManager.uiSettings.selectedChar
            });
            PlatformShim.execUnsafeLocalFunction(function () {
                $(".selectionOverlayContainer").hide();
                k(m, a);
                var b = $("#researchMenu");
                b.find(".windowTitle").text(a ? "Training Options".localize("heading") : "What do you want to research?".localize());
                var d = b.find(".staffInfoPanel");
                a &&
                    d.empty().append(c(m));
                var g = a ? "Start Training".localize("button") : "Start Research".localize("button");
                UI.showModalContent("#researchMenu", {
                    close: !0,
                    disableCheckForNotifications: !0,
                    onClose: function () {
                        GameManager.company.activeNotifications.splice(0, 1);
                        f && f()
                    },
                    onOpen: function () {
                        a ? d.delay(200).queue(function () {
                            $(this).removeClass("hidden").addClass("showState");
                            $(this).dequeue()
                        }) : d.removeClass("showState").addClass("hidden");
                        UI.maxFont("bold", $(".simplemodal-data").find(".okButton"), 22, g);
                        UI.maxFont(void 0,
                            $(".simplemodal-data").find(".trainingD .leftColumn"), 22, void 0, !0);
                        UI.maxFont(void 0, $(".simplemodal-data").find(".trainingS .leftColumn"), 22, void 0, !0);
                        UI.maxFont(void 0, $(".simplemodal-data").find(".trainingT .leftColumn"), 22, void 0, !0);
                        UI.maxFont(void 0, $(".simplemodal-data").find(".trainingR .leftColumn"), 22, void 0, !0)
                    }
                })
            })
        },
        c = function (a) {
            var b = $("#trainingStaffInfo").clone(),
                c = b.find(".name"),
                d = 15,
                f = UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" : "Open Sans";
            do {
                var k = "{0} {1}pt {2}".format("bold", d, f),
                    k = new createjs.Text(a.name, k, "black");
                d--
            } while (195 < 1.1 * k.getMeasuredWidth() && 10 < d);
            c.css({
                font: "{0} {1}pt {2}".format("bold", d, f)
            }).text(a.name);
            a.flags.expert && b.find(".expert").text("({0})".format(Missions.getMissionWithId(a.flags.expert).name));
            b.find(".lvl").text(a.getLevel());
            b.find(".design").text(a.getDesignSkillPoints());
            b.find(".technology").text(a.getTechnologySkillPoints());
            b.find(".speed").text(a.getSpeedSkillPoints());
            b.find(".research").text(a.getResearchSkillPoints());
            return b
        },
        f =
            function () {
                var a = $(".simplemodal-data").find("#startResearchButton");
                d && !a.hasClass("orangeButton") && (a.removeClass("disabledButton").addClass("orangeButton"), a.clickExcl(function () {
                    m()
                }))
            },
        d, k = function (a, b) {
            var c = $("#researchButtonContainer"),
                k;
            k = b ? Training.getAvailableTraining(a) : GameManager.company.availableResearch.filter(function (a) {
                return "New Topic" === a.id || 0 === GameManager.currentResearches.filter(function (b) {
                    return b.id === a.id
                }).length
            }).groupBy(function (a) {
                return a.category
            });
            c.empty();
            var m =
                null;
            $("#selectableGameFeatureItem");
            d = null;
            for (var s = function (a, b) {
                a.hasClass("selectedFeature") ? (a.removeClass("selectedFeature"), d = null) : ($(".simplemodal-data").find(".selectedFeature").removeClass("selectedFeature"), a.addClass("selectedFeature"), d = b);
                f()
            }, u = 0; u < k.length; u++) {
                var t = k[u],
                    q = Research.getPointsCost(t);
                t.category != m && (c.append($('<div class="featureSelectionCategoryHeading">{0}</div>'.format(t.categoryDisplayName ? t.categoryDisplayName : t.category))), m = t.category);
                var v = UI.generateFeatureElement(t);
                v.find(".levelLabel").hide();
                t.style && v.addClass(t.style);
                t.isTraining && t.canUse && !t.canUse(a, GameManager.company) && v.addClass("disabled");
                var A = t.name + ' (<span class="rpCost">{0} {1}</span>'.format(UI.getShortNumberString(q), "RP".localize("RP short for research points")),
                    z = Research.getResearchCost(t);
                z && (A += ', <span class="crCost">{0} {1}</span>'.format(UI.getShortNumberString(z), "cr.".localize("cr. short for credits")));
                A += ")";
                v.find(".featureContent").html(A);
                A = !0;
                q > GameManager.company.researchPoints &&
                    (v.find(".rpCost").addClass("red"), A = !1);
                GameManager.company.cash < z && (v.find(".crCost").addClass("red"), A = !1);
                v.addClass("radioButton");
                A || v.addClass("disabled").addClass("disabledButton").addClass("no-click").addClass("no-hover");
                (function (b, c) {
                    var d = Research.getPointsCost(c);
                    b.clickExcl(function () {
                        if (!(d > GameManager.company.researchPoints || c.isTraining && c.canUse && !c.canUse(a, GameManager.company)))
                            if (s(b, c), c == Research.ResearchTopicItem) UI.pickTopicClick("research"), b.hasClass("selectedFeature") ||
                                s(b, c);
                            else {
                                var f = Research.ResearchTopicItem.name + " ({0} ".format(UI.getShortNumberString(Research.getPointsCost(Research.ResearchTopicItem))) + "RP".localize("RP short for research points"),
                                    g = Research.getResearchCost(Research.ResearchTopicItem);
                                g && (f += ", {0} ".format(UI.getShortNumberString(g)) + "cr.".localize("cr. short for credits"));
                                f += ")";
                                $(".simplemodal-data").find(".pickTopicButton").text(f)
                            }
                    })
                })(v, t);
                t == Research.ResearchTopicItem && v.addClass("pickTopicButton");
                c.append(v)
            }
        },
        m = function () {
            Sound.click();
            if (d) {
                var b = $(".simplemodal-data");
                if (d === Research.ResearchTopicItem) {
                    var c = b.find(".pickTopicButton").get(0).innerText,
                        b = Topics.topics.first(function (a) {
                            return a.name == c
                        });
                    if (!b) return;
                    GameManager.researchTopic(b)
                } else GameManager.research(d, a ? "training" : "research");
                UI.closeModal()
            }
        }
})();
(function () {
    UI._gameDetailsColumn1FontSize = void 0;
    UI._getElementForGameDetail = function (a, b) {
        var c = GameManager.company.getDate(a.releaseWeek),
            f = $("#gameDetailsTemplate").clone();
        f.removeAttr("id");
        f.find(".gameDetailsTitle").text(a.title);
        if (a.flags.pirated) {
            f.find(".gameDetailsPiracyImage").show();
            var d = "?";
            a.flags.postMortemCompleted && (d = Math.floor(a.flags.piracyRate) + "%");
            f.find(".gameDetailsPiracyRate").text(d).show()
        }
        if (void 0 == UI._gameDetailsColumn1FontSize) {
            for (var k = f.find(".gameDetailsColumn1"),
                d = [], m = 0; m < k.length; m++) k[m].innerText && d.push(k[m].innerText);
            k = UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" : "Open Sans";
            UI._gameDetailsColumn1FontSize = 15;
            for (var l = "bolder {0}pt {1}".format(UI._gameDetailsColumn1FontSize, k), m = 0; m < d.length && 10 != UI._gameDetailsColumn1FontSize; m++) 180 < 1.1 * (new createjs.Text(d[m], l, "black")).getMeasuredWidth() && (UI._gameDetailsColumn1FontSize -= 1, l = "{0}pt {1}".format(UI._gameDetailsColumn1FontSize, k), m--)
        }
        f.find(".gameDetailsColumn1").css({
            "font-size": UI._gameDetailsColumn1FontSize +
                "pt"
        });
        UI.IS_SEGOE_UI_INSTALLED || (f.find(".gameDetailsColumn1").css({
            "font-family": "Open Sans"
        }), f.find(".gameDetailsColumn2").css({
            "font-size": "12pt",
            "font-family": "Open Sans"
        }));
        f.find(".gameId").text(a.id);
        a.secondGenre ? f.find(".gameDetailsTopicGenre").text(a.topic.name + "/" + a.genre.name + "-" + a.secondGenre.name) : f.find(".gameDetailsTopicGenre").text(a.topic.name + "/" + a.genre.name);
        d = a.platforms.map(function (a) {
            return a.name
        }).join(", ");
        f.find(".gameDetailsPlatform").text(d); - 1 != GameManager.company.researchCompleted.indexOf(Research.TargetAudience) &&
            f.find(".gameDetailsAudience").text(General.getAudienceLabel(a.targetAudience));
        f.find(".gameDetailsImage").attr("src", Platforms.getPlatformImage(a.platforms[0], a.releaseWeek));
        f.find(".gameDetailsCosts").text(UI.getShortNumberString(a.costs));
        a.releaseWeek > GameManager.company.currentWeek ? f.find(".gameDetailsReleaseWeek").text("coming soon".localize()) : f.find(".gameDetailsReleaseWeek").text("Y{0} M{1} W{2}".localize("date display").format(c.year, c.month, c.week));
        0 < a.revenue ? (f.find(".gameDetailsAmountEarned").text(UI.getShortNumberString(a.revenue)),
            c = f.find(".gameDetailsTotal"), d = a.revenue - a.costs, 0 > d ? (f.find(".gameDetailsTotalLabel").text("Loss:".localize()), c.addClass("red")) : c.addClass("green"), c.text(UI.getShortNumberString(d)), f.find(".gameDetailsFansChange").text(UI.getLongNumberString(Math.max(0, Math.round(a.fansChanged)))), 0 < a.topSalesRank ? f.find(".gameDetailsTopSalesRank").text(a.topSalesRank) : f.find(".gameDetailsTopSalesRank").text("100+"), f.find(".gameDetailsUnitsSold").text(UI.getShortNumberString(a.unitsSold))) : (c = a.flags.isExtensionPack ?
                "-" : "?", f.find(".gameDetailsUnitsSold").text(c), f.find(".gameDetailsAmountEarned").text(c), f.find(".gameDetailsTotal").text(c), f.find(".gameDetailsFansChange").text(c), f.find(".gameDetailsTopSalesRank").text(c), f.find(".gameDetailsAmountEarned").removeClass("green"));
        a.reviewMessageDisplayed ? (f.find(".gameAverageScoreOverview").text(b), f.find(".gameDetailsAvgReview").text(b)) : (f.find(".gameAverageScoreOverview").text("?"), f.find(".gameDetailsAvgReview").text("?"));
        return f
    };
    UI.showGameHistory = function (a,
        b, c) {
        b = b ? !0 === GameManager.flags.createPack ? GameManager.company.getPossibleGamesForPack() : GameManager.company.getPossibleGamesForSequel() : GameManager.company.gameLog;
        c && (b = GameManager.company.gameLog.filter(function (a) {
            return a.canDoPostMortem()
        }));
        if (0 < b.length) {
            GameManager.pause(!0);
            var f = $("#gameHistoryDialog"),
                d = f.find("#gameHistoryContent");
            d.empty();
            var k = $('<div class="gameHistorySliderContainer royalSlider rsDefaultInv"></div>');
            d.append(k);
            b.slice().sort(function (a, b) {
                return a.releaseWeek >
                    b.releaseWeek ? 1 : -1
            });
            for (d = b.length - 1; 0 <= d; d--) {
                var m = b[d];
                if (!m.flags.isExtensionPack || c) {
                    var l = m.reviews.average(function (a) {
                        return a.score
                    }),
                        m = UI._getElementForGameDetail(m, l);
                    k.append(m)
                }
            }
            var g = GameManager.flags.selectGameActive;
            g && (GameManager.flags.selectedGameId = null);
            c = g ? "Select Game".localize("heading") : "Game History".localize();
            f.find(".windowTitle").text(c);
            c = g ? "Select".localize("button") : "OK".localize();
            f.find(".okButton").text(c).clickExcl(function () {
                Sound.click();
                g && (GameManager.flags.selectedGameId =
                    f.find(".rsActiveSlide").find(".gameId").text());
                $("#gameHistoryDialog").dialog("close");
                GameManager.resume(!0)
            });
            PlatformShim.ISWIN8 && k.gdSlider();
            f.dialog({
                draggable: !1,
                width: 660,
                height: 650,
                modal: !0,
                resizable: !1,
                show: "fade",
                zIndex: 6E3,
                open: function () {
                    UI.maxFont("bolder", f.find(".windowTitle"), 34);
                    var a = $(this).parents(".ui-dialog:first").find(".closeDialogButton");
                    0 == a.length && (a = $(UI.closeButtonTemplate), $(this).parents(".ui-dialog:first").append(a));
                    a.zIndex = 4500;
                    a.clickExclOnce(function () {
                        Sound.click();
                        f.dialog("close")
                    });
                    $(this).siblings(".ui-dialog-titlebar").remove();
                    $(this).parents(".ui-dialog:first").addClass("tallWindow");
                    $(this).parents(".ui-dialog:first").addClass("windowBorder");
                    $(this).parents(".ui-dialog:first").removeClass("ui-widget-content");
                    PlatformShim.ISWIN8 || k.gdSlider()
                },
                close: function () {
                    $(this).dialog("destroy");
                    this.style.cssText = "display:none;";
                    a && a();
                    GameManager.resume(!0)
                }
            })
        } else a && a()
    }
})();
(function () {
    UI.showGameEnd = function (c, d) {
        var g = $("#gameEndDialog");
        f = 1;
        g.find(".next").hide().clickExclOnce(function () {
            g.dialog("close")
        });
        g.find(".companyName").text(GameManager.company.name).hide();
        $("#gameEndDialog").gdDialog({
            popout: !0,
            onOpen: function () {
                u(g);
                l(g)
            },
            onClose: function () {
                a = [];
                b = [];
                GameManager.removeFromActiveNotifications(c);
                Media.createEndOfGameStories();
                GameManager.resume(!0);
                d && d()
            }
        })
    };
    var a = [],
        b = [],
        c, f = 1,
        d = function () {
            f += 0.4
        },
        k, m = function (d) {
            if (0 !== a.length || c) {
                d *= f;
                for (var g = 0; g <
                    a.length; g++) a[g].tick(d, !1);
                for (g = 0; g < b.length; g++) d = b[g], d.int_value != d._currentValue && (0 != d.int_value && d.text(UI.getLongNumberString(Math.floor(d.int_value))), d._currentValue = d.int_value), d._scale != d._currentScale && (d.transition({
                    scale: d._scale
                }, 0), d._currentScale = d._scale), d._opacity != d._currentOpacity && (d.css("opacity", d._opacity), d._currentOpacity = d._opacity), d._top != d._currentTop && (d.css("top", d._top), d._currentTop = d._top), d._left != d._currentLeft && (d.css("left", d._left), d._currentLeft = d._left);
                c && c.update()
            }
        },
        l = function (f) {
            a = [];
            b = [];
            var g = GameManager.company,
                l = f.find(".counterContainer");
            l.empty();
            var p = document.createElement("canvas");
            p.width = 700;
            p.height = 150;
            var s = new FlippingCounter.FlippingBox(8, 6);
            s.init();
            s.fill(0);
            s.container.x = 41;
            s.container.y = 41;
            FlippingCounter._activeUITweens = a;
            var u = new createjs.Container;
            u.addChild(FlippingCounter.panel);
            u.addChild(s.container);
            u.x = 160;
            u.scaleX = 0.5;
            u.scaleY = 0.5;
            c = new createjs.Stage(p);
            c.addChild(u);
            l.append($(p));
            p = r(g);
            l = f.find(".animationItemsContainer");
            l.empty();
            for (var u = $("#gameEndAnimationItem"), D = 0, E = 0, w = createjs.Tween.get(l), F = 0; F < p.length; F++) {
                var C = u.clone().removeAttr("id");
                C.label = C.find(".label");
                C.value = C.find(".value");
                C.value.text("0").css("opacity", 0);
                C.value._opacity = 0;
                (function (c, d, f) {
                    c.value.int_value = 0;
                    var g = createjs.Tween.get(c.value).wait(D).call(function () {
                        n(c, f)
                    });
                    1 <= d.value && g.wait(1700).set({
                        _opacity: 1
                    }).to({
                        int_value: d.value
                    }, 700).call(function () {
                        E += d.value;
                        s.fill(Math.floor(E))
                    });
                    var k = c.label.text(d.label).typewrite({
                        wait: D +
                            650,
                        delay: 20,
                        soundLoop: "notificationTyping",
                        volume: 0.12,
                        type: "return-tween"
                    });
                    b.push(c.value);
                    c.hide();
                    l.append(c);
                    D += 3700;
                    a.addRange([g, k])
                })(C, p[F], F)
            }
            w.wait(D).call(function () {
                var a = f.find(".companyName").remove();
                l.append(a);
                a.fadeIn();
                f.find(".next").slideDown();
                g.flags.finalScore = E;
                DataStore.setScore(g.uid, g.name, E)
            }).wait(700).call(function () {
                Achievements.activate(Achievements.finishedGame);
                g.flags.pirateMode && Achievements.activate(Achievements.againstAllOdds);
                GameManager.checkAchievements()
            });
            a.push(w);
            $(window).on("click", d);
            w.wait(D).call(function () {
                $(window).off("click", d)
            });
            k || (GameManager.addTickListener(m, !1), k = !0)
        },
        g = [],
        n = function (c, d) {
            0 === d && (g = []);
            var f = createjs.Tween.get(c);
            c.css({
                position: "absolute",
                opacity: 0
            }).show();
            var k = c.width();
            c.height();
            c.css({
                left: 390 - k / 2,
                top: 20
            });
            c._opacity = 0;
            c._scale = 0;
            c._top = 20;
            c._left = 390 - k / 2;
            var l = g.slice();
            f.to({
                _opacity: 1,
                _scale: 1.6
            }, 1500).wait(2500).to({
                _scale: 1,
                _left: 20,
                _top: 130
            }, 400);
            k = createjs.Tween.get(l);
            k.wait(4E3).call(function () {
                c.value.transition({
                    opacity: 0
                })
            }).call(function () {
                for (var b =
                    0; b < l.length; b++) {
                    var c = g[b],
                        d = createjs.Tween.get(c);
                    c.tween && -1 != a.indexOf(c.tween) && a.remove(c.tween);
                    c.tween = d;
                    c.tween.to({
                        _top: c._top + 30
                    }, 400, createjs.Ease.sineIn);
                    a.push(c.tween)
                }
            });
            b.push(c);
            a.push(f);
            a.push(k);
            g.push(c)
        },
        r = function (a) {
            var b = [],
                c = a.gameLog.filter(function (a) {
                    return "small" === a.gameSize
                }),
                d = a.gameLog.filter(function (a) {
                    return "medium" === a.gameSize
                }),
                f = a.gameLog.filter(function (a) {
                    return "large" === a.gameSize
                }),
                g = a.gameLog.filter(function (a) {
                    return "aaa" === a.gameSize
                }),
                k = c.concat(d).concat(f).concat(g),
                l = a.gameLog.slice().sort(function (a, b) {
                    return b.costs - a.costs
                });
            0 < l && (l = l.first(), b.push({
                label: "Most expensive ({0}): {1}".localize().format(l.title, UI.getShortNumberString(l.costs))
            }));
            l = a.gameLog.slice().sort(function (a, b) {
                return b.totalSalesCash - b.costs - (a.totalSalesCash - a.costs)
            });
            if (0 < l) {
                var m = l.first();
                b.push({
                    label: "Most profitable ({0}): {1}".localize().format(m.title, UI.getShortNumberString(m.totalSalesCash - m.costs))
                })
            }
            1 < l.length && (l = l.last(), b.push({
                label: "Least profitable ({0}): {1}".localize().format(l.title,
                    UI.getShortNumberString(l.totalSalesCash - l.costs))
            }));
            l = a.gameLog.map(function (a) {
                return a.topic.name
            });
            if (m = s(l)) {
                var n = m[0],
                    m = m.join(", ");
                b.push({
                    label: "Most used topic ({0}): {1}".localize().format(m, l.count(function (a) {
                        return a == n
                    }))
                })
            }
            l = a.gameLog.map(function (a) {
                return a.genre.name
            });
            if (m = s(l)) {
                var p = m[0],
                    m = m.join(" ,");
                b.push({
                    label: "Most used genre ({0}): {1}".localize().format(m, l.count(function (a) {
                        return a == p
                    }))
                })
            }
            b.push({
                label: "Researched topics: {0}".localize().format(a.topics.length),
                value: 100 * a.topics.length
            });
            l = a.researchCompleted.count();
            b.push({
                label: "Total research completed: {0}".localize().format(l),
                value: 100 * l
            });
            l = k.sum(function (a) {
                return a.designPoints
            });
            b.push({
                label: "Design points generated: {0}".localize().format(l),
                value: 10 * l
            });
            l = k.sum(function (a) {
                return a.technologyPoints
            });
            b.push({
                label: "Technology points generated: {0}".localize().format(l),
                value: 10 * l
            });
            l = c.sum(function (a) {
                return a.score / 10 * 1E3 * GameGenre.getGenreWeighting(a.topic.genreWeightings, a.genre, a.secondGenre)
            });
            b.push({
                label: "Small games: {0}".localize().format(c.count()),
                value: l
            });
            l = d.sum(function (a) {
                return 5E3 * a.score * GameGenre.getGenreWeighting(a.topic.genreWeightings, a.genre, a.secondGenre)
            });
            b.push({
                label: "Medium games: {0}".localize().format(d.count()),
                value: l
            });
            l = f.sum(function (a) {
                return 1E4 * a.score * GameGenre.getGenreWeighting(a.topic.genreWeightings, a.genre, a.secondGenre)
            });
            b.push({
                label: "Large games: {0}".localize().format(f.count()),
                value: l
            });
            l = g.sum(function (a) {
                return 5E4 * a.score * GameGenre.getGenreWeighting(a.topic.genreWeightings,
                    a.genre, a.secondGenre)
            });
            b.push({
                label: "AAA games: {0}".localize().format(g.count()),
                value: l
            });
            l = k.count(function (a) {
                return 7.6 < a.score && 9 > a.score
            });
            b.push({
                label: "Good games: {0}".localize().format(l),
                value: 1E5 * l
            });
            l = k.count(function (a) {
                return 9 <= a.score
            });
            b.push({
                label: "Top hits: {0}".localize().format(l),
                value: 2E6 * l
            });
            l = k.count(function (a) {
                return a.flags.royaltyRate
            });
            b.push({
                label: "Publishers used: {0}".localize().format(l),
                value: 1E3 * l
            });
            l = k.length - l;
            b.push({
                label: "Self-published games: {0}".localize().format(l),
                value: 5E3 * l
            });
            if (c = a.getBestSeller()) l = 1E6 * c.score, b.push({
                label: "Best seller: {0} ({1} units)".localize().format(c.title, UI.getShortNumberString(c.unitsSold)),
                value: l
            });
            b.push({
                label: "Fans: {0}".localize().format(UI.getShortNumberString(a.fans)),
                value: 4 * a.fans
            });
            b.push({
                label: "Cash: {0}".localize().format(UI.getShortNumberString(a.cash)),
                value: (0.01 * a.cash).clamp(0, 5555555)
            });
            a = a.licencedPlatforms.filter(function (a) {
                return a.isCustom
            });
            l = a.sum(function (a) {
                return 1E6 * a.successFactor
            });
            b.push({
                label: "Custom consoles: {0}".localize().format(a.length),
                value: l
            });
            return b
        };
    UI.getThanksForPurchasingNotification = function (a) {
        (a = a ? a : PlatformShim.getUserName()) && 0 != a.length && a != "Player".localize() || (a = "you".localize());
        a = "To: {0}\nFrom: Patrick & Daniel Klug (Greenheart Games).\nHi {0}, we are the creators of Game Dev Tycoon and would like to thank you very much for purchasing the game and supporting us.{n}Game Dev Tycoon is our very first game and it means a lot to us that you are enjoying it. With your purchase you support our little start-up and this will hopefully make sure that we can bring you more games in the future.{n}Seriously, you rock! Thank you very much and have fun with Game Dev Tycoon.".localize().format(a) +
            "\n\nPatrick & Daniel Klug\nGreenheart Games\nwww.greenheartgames.com";
        a = new Notification({
            header: "Thank you".localize("heading"),
            text: a,
            image: "./images/greenheart.png",
            weeksUntilFired: 1,
            previewImage: "./images/notificationIcons/icon_notification_thank_you.png",
            type: NotificationType.CompanyMilestones
        });
        a.adjustFans(2);
        return a
    };
    purchaseGame = function (a, b) {
        ghg4.ghg5("purchased-clicked");
        GameManager.ghg3().requestAppPurchaseAsync(!0).done(function (a) {
            a ? GameManager.ghg2() ? (PlatformShim.alert("It seems that something went wrong when purchasing the app.\nPlease close the app and try again later.\n If the issue persists please contact\n\n{0}".localize().format("support@greenheartgames.com"),
                "Store Confirmation Error".localize("heading")), ghg4.ghg5("purchased but still trial")) : GameManager.ghg2() || (ghg4.ghg5("purchased"), Achievements.activate(Achievements.supporter), GameManager.checkAchievements(), GameManager.company.notifications.push(UI.getThanksForPurchasingNotification()), DataStore.setValue("thankYouMessageShown", !0), b && b()) : ghg4.ghg5("purchase cancelled")
        }, function (a) {
            ghg4.ghg5("purchase unsuccessful", {
                error: a.message,
                "error-number": a.number
            });
            PlatformShim.alert("It seems that something went wrong when trying to purchase the app.\nThis usually indicates a problem with the Store. Please try again later and if the issue persists please contact\n\n{0}".localize().format("support@greenheartgames.com"),
                "Store Error".localize("heading"))
        })
    };
    var p = function (a, b) {
        Sound.click();
        if (GameManager.ghg0()) {
            var c = DataStore.getValue("full-game-uri");
            if (PlatformShim.ISWIN8) {
                c || (c = "http://www.greenheartgames.com/game-dev-tycoon-status");
                var d = new Windows.Foundation.Uri(c);
                Windows.System.Launcher.launchUriAsync(d).then(function (a) {
                    a ? ghg4.ghg5("navigate-to-full-game", {
                        url: c,
                        success: !0
                    }) : (ghg4.ghg5("navigate-to-full-game", {
                        url: c,
                        success: !1
                    }), Windows.UI.Popups.MessageDialog("It seems that something went wrong when trying to go to the Store page for the full app.\nPlease try again and if the issue persists please contact {0} or search for Game Dev Tycoon manually on the Windows Store.".localize().format("support@greenheartgames.com"),
                        "Store Error".localize("heading")).showAsync())
                })
            } else c || (c = "http://www.greenheartgames.com/game-dev-tycoon-downloads"), PlatformShim.openUrlExternal(c)
        } else purchaseGame(b, function () {
            GameManager.ghg2() || a.dialog("close")
        })
    };
    UI.showTrialEnd = function (a, b) {
        if (GameManager.ghg2()) {
            var c = $("#gameEndTrialDialog"),
                d = GameManager.ghg0() ? "lite".localize("as in lite edition of the game") : "trial".localize(),
                f = "You have reached the end of the {0} version.\nIf you like what you've seen so far then you should definitely check out the full game. You can find a brief description of what awaits you below.".localize();
            GameManager.ghg0() || (f += "\n\n<strong>If you unlock the full game you can continue playing the game you've already started.</strong>".localize());
            c.find(".endOfGameBlurb").html(f.replaceAll("\n", "<br/>").format(d));
            d = $("#fullGameFeatureTeaser").clone();
            d.removeAttr("id");
            c.find(".featureTeaserContainer").empty().append(d);
            var g = c.find(".purchaseButton");
            g.text(GameManager.ghg0() ? "Go to full game ...".localize() : " Unlock full game ...".localize()).clickExcl(function () {
                p(c, a)
            });
            c.gdDialog({
                popout: !0,
                close: !1,
                onOpen: function () {
                    u(c);
                    UI.maxFont(void 0, g, 18)
                },
                onClose: function () {
                    GameManager.ghg2() || (GameManager.removeFromActiveNotifications(a), GameManager.resume(!0), b && b())
                }
            })
        } else GameManager.removeFromActiveNotifications(a), GameManager.resume(!0), b && b()
    };
    var s = function (a) {
        for (var b = [], c = 0; c < a.length; c++) - 1 == b.indexOf(a[c]) && b.push(a[c]);
        for (var d = {}, f = 0, c = 0; c < b.length; c++) {
            var g = a.count(function (a) {
                return a == b[c]
            });
            d[c] = g;
            g > f && (f = g)
        }
        return 1 >= f ? null : b.filter(function (a) {
            return d[b.indexOf(a)] ==
                f
        })
    },
        u = function (a) {
            a = a.find(".gameEndStatisticsContainer");
            var b = GameManager.company,
                c = [];
            c.push({
                name: "Cash".localize(),
                value: UI.getShortNumberString(b.cash)
            });
            c.push({
                name: "Total fans".localize(),
                value: b.fans
            });
            c.push({
                name: "Total game releases".localize(),
                value: UI.getShortNumberString(b.gameLog.length)
            });
            if (0 < b.gameLog.length) {
                c.push({
                    name: "Total unit sales".localize(),
                    value: UI.getShortNumberString(b.gameLog.sum(function (a) {
                        return a.unitsSold
                    }))
                });
                c.push({
                    name: "Total design points generated".localize(),
                    value: UI.getShortNumberString(b.gameLog.sum(function (a) {
                        return a.designPoints
                    }))
                });
                c.push({
                    name: "Total technology points generated".localize(),
                    value: UI.getShortNumberString(b.gameLog.sum(function (a) {
                        return a.technologyPoints
                    }))
                });
                c.push({
                    name: "Total research completed".localize(),
                    value: b.researchCompleted.length
                });
                var d = b.gameLog.slice().sort(function (a, b) {
                    return b.unitsSold - a.unitsSold
                }).first();
                c.push({
                    name: "Most sales ({0})".localize().format(d.title),
                    value: UI.getShortNumberString(d.unitsSold)
                });
                d = b.gameLog.slice().sort(function (a, b) {
                    return b.fansChanged - a.fansChanged
                }).first();
                c.push({
                    name: "Most fans ({0})".localize().format(d.title),
                    value: UI.getShortNumberString(d.fansChanged)
                });
                d = b.gameLog.slice().sort(function (a, b) {
                    return b.costs - a.costs
                }).first();
                c.push({
                    name: "Most expensive ({0})".localize().format(d.title),
                    value: UI.getShortNumberString(d.costs)
                });
                var d = b.gameLog.slice().sort(function (a, b) {
                    return b.totalSalesCash - b.costs - (a.totalSalesCash - a.costs)
                }),
                    f = d.first();
                c.push({
                    name: "Most profitable ({0})".localize().format(f.title),
                    value: UI.getShortNumberString(f.totalSalesCash - f.costs)
                });
                1 < d.length && (d = d.last(), c.push({
                    name: "Least profitable ({0})".localize().format(d.title),
                    value: UI.getShortNumberString(d.totalSalesCash - d.costs)
                }));
                d = b.gameLog.map(function (a) {
                    return a.topic.name
                });
                if (f = s(d)) {
                    var g = f[0],
                        f = f.join(", ");
                    c.push({
                        name: "Most used topic ({0})".localize().format(f),
                        value: d.count(function (a) {
                            return a == g
                        })
                    })
                }
                b = b.gameLog.map(function (a) {
                    return a.genre.name
                });
                if (d = s(b)) {
                    var k = d[0],
                        f = d.join(" ,");
                    c.push({
                        name: "Most used genre ({0})".localize().format(f),
                        value: b.count(function (a) {
                            return a == k
                        })
                    })
                }
            }
            a.empty();
            b = $("#gameEndStatisticItem");
            for (d = 0; d < c.length; d++) {
                var f = c[d],
                    l = b.clone();
                l.removeAttr("id");
                l.text("{0}: {1}".format(f.name, f.value));
                a.append(l)
            }
        };
    UI.showgameTrialDialog = function () {
        GameManager.pause(!0);
        Sound.click();
        var a = $("#gameTrialDialog"),
            b = GameManager.ghg0() ? "lite" : "trial",
            c = "Thank you for playing the {0} version.\nIf you like what you've seen so far then you should definitely check out the full game.".localize();
        GameManager.ghg0() ||
            (c += "\n\n<strong>" + "If you unlock the full game you can continue playing the game you've already started.".localize() + "</strong>");
        a.find(".gameTrialBlurb").html(PlatformShim.toStaticHtml(c.replaceAll("\n", "<br/>").format(b)));
        b = $("#fullGameFeatureTeaser").clone();
        b.removeAttr("id");
        a.find(".featureTeaserContainer").empty().append(b);
        a.find(".purchaseButton").text(GameManager.ghg0() ? "Go to full game ...".localize() : " Unlock full game ...".localize()).clickExcl(function () {
            p(a)
        });
        $("#gameTrialDialog").gdDialog({
            popout: !0,
            close: !0,
            onClose: function () {
                GameManager.resume(!0)
            }
        })
    }
})();
(function () {
    function a() {
        var a = GameManager.company;
        if (a.cash < m) $(".okButtonWrapper").effect("shake", {
            times: 2,
            distance: 5
        }, 50);
        else {
            a.adjustCash(-m, "Find Staff".localize("heading"));
            var b = l / 100,
                c = 1.5 + 1.5 * b;
            Tutorial.hiringStaff(c);
            a.notifications.push(new Notification("{HireStaff}", null, null, c));
            GameManager.uiSettings.findStaffData = {
                costs: m,
                ratio: b,
                tests: k.map(function (a) {
                    return a.id
                }),
                slot: f,
                startWeek: GameManager.company.currentWeek,
                targetWeek: GameManager.company.currentWeek + c,
                seed: Math.floor(65535 *
                    a.getRandom())
            };
            k.first();
            UI.closeModal()
        }
    }
    var b = [{
        id: "ComplexAlgorithms",
        name: "Complex Algorithms".localize(),
        minT: 0.6
    }, {
        id: "GameDemo",
        name: "Game Demo".localize(),
        minD: 0.3,
        minT: 0.3
    }, {
        id: "Showreel",
        name: "Showreel".localize(),
        minD: 0.6
    }];
    UI.isStaffSearchInProgress = function () {
        return GameManager.uiSettings ? null != GameManager.uiSettings.findStaffData : !1
    };
    var c;
    GameManager.addTickListener(function () {
        if (UI.isStaffSearchInProgress() && GameManager.company) {
            var a = GameManager.uiSettings.findStaffData,
                a = ((GameManager.company.currentWeek -
                    a.startWeek) / (a.targetWeek - a.startWeek)).clamp(0, 1);
            c || (c = $("#canvasContainer"));
            var b = c.find(".hireStaffButtonBase");
            b.hasClass("hireStaffButton") && (b.unbind("click").removeClass("hireStaffButton").find(".hireButtonLabel").text("Searching...".localize("button")), UI.maxFont("bold", b.find(".hireButtonLabel"), 12));
            b.find(".hireStaffProgress").css("width", 100 * a + "%")
        }
    }, !0);
    var f = 0;
    UI.showFindStaffWindow = function (c) {
        if (!UI.isStaffSearchInProgress()) {
            f = c;
            c = $(".hireStaffBudgetSlider");
            c.empty();
            var l = $('<div class="budgetSlider"></div>').slider({
                orientation: "horizontal",
                range: "min",
                min: 0,
                max: 100,
                value: 0,
                animate: "fast",
                slide: function (a, b) {
                    var c = $(b.handle).closest(".budgetSlider");
                    if (!c.hasClass("budgetSlider")) throw "couldn't find target slider";
                    c.slider("value", b.value);
                    g()
                }
            });
            c.append(l);
            m = 0;
            k = [];
            c = $(".findStaffFilters");
            c.empty();
            for (l = 0; l < b.length; l++) c.append(d(b[l]));
            $("#findStaffDialog").find(".okButton").clickExcl(a);
            UI.showModalContent("#findStaffDialog", {
                close: !0,
                onOpen: function () {
                    g()
                }
            })
        }
    };
    var d = function (a) {
        var b = $('<div class="selectableGameFeatureItem"></div>').text(a.name);
        b.clickExcl(function () {
            b.hasClass("selectedFeature") ? (b.removeClass("selectedFeature"), k = []) : (b.parent().find(".selectableGameFeatureItem").removeClass("selectedFeature"), k = [], b.addClass("selectedFeature"), k.push(a))
        });
        return b
    },
        k = [],
        m = 0,
        l = 0,
        g = function () {
            var a = $(".simplemodal-data"),
                b = a.find(".budgetSlider").slider("value"),
                c, d = b / 100;
            c = (d /= 1) * d;
            d *= c;
            c = Math.floor(2 + 198 * (0 + 1 * (-0.5 * d * c + 3 * c * c + -3.5 * d + 2 * c)));
            m = c *= 1E4;
            l = b;
            a = a.find(".windowCostLabel");
            UI.maxFont(void 0, a, 20, "Cost: {0}".localize().format(UI.getShortNumberString(m)));
            a.toggleClass("red", m > GameManager.company.cash)
        };
    UI._generateJobApplicants = function () {
        var a = GameManager.uiSettings.findStaffData;
        a || (a = {
            ratio: 0.1,
            tests: []
        });
        a.seed || (a.seed = Math.floor(65535 * GameManager.company.getRandom()));
        for (var c = a.ratio, d = b.first(function (b) {
            return b.id == a.tests.first()
        }), f = GameManager.company, g = new MersenneTwister(a.seed), k = [], l = Math.floor(2 + 3 * (c + 0.2).clamp(0, 1)), m = 0, n = 4 == f.currentLevel ? 0.8 : 0.4, H = GameManager.company.staff.map(function (a) {
            return a.name
        }), G = 0; G < l; G++) {
            var I = c /
                3 + (1 - c / 3) * g.random();
            0.95 <= g.random() && (n += 0.2);
            var N = 0.2 + n * I,
                O = Math.floor(5 * N).clamp(1, 5),
                M = 1,
                R = 0;
            d && (d.minT && (M -= d.minT), d.minD && (R = d.minD, M -= R));
            var S = 200 * O,
                M = S * R + S * M * g.random(),
                S = S - M,
                Q = g.random(),
                R = 0.2 + n * Q,
                P = g.random(),
                W = 0.2 + n * P,
                Q = 0.5 < P && 0.5 < I && 0.5 < Q;
            if (!Q && 2 > m && g.random() <= (c + 0.1).clamp(0, 0.7)) G--, m++;
            else {
                var m = 0,
                    P = !1,
                    I = "male",
                    U, P = 0.25;
                f.flags.sponsoredWomenInTech && (P = 0.5);
                g.random() < P && (I = "female");
                do Q ? (U = 0.5 > S / M ? "female" === I ? t.pickRandom(g) : p.pickRandom(g) : 0.5 > M / S ? "female" === I ? u.pickRandom(g) :
                    r.pickRandom(g) : "female" === I ? q.pickRandom(g) : s.pickRandom(g), P = !0) : (U = "female" === I ? v.pickRandom(g) + " " + z.pickRandom(g) : A.pickRandom(g) + " " + z.pickRandom(g), P = !1); while (-1 != H.indexOf(U));
                H.push(U);
                O *= Character.BASE_SALARY_PER_LEVEL;
                O += 0.2 * O * g.random() * g.randomSign();
                O = 1E3 * Math.floor(O / 1E3);
                k.push({
                    name: U,
                    qualityFactor: N,
                    technologyFactor: S / 500,
                    designFactor: M / 500,
                    researchFactor: R,
                    speedFactor: W,
                    salary: O,
                    isFamous: P,
                    sex: I
                })
            }
        }
        GDT.fire(GameManager, GDT.eventKeys.gameplay.staffApplicantsGenerated, {
            applicants: k,
            settings: a,
            rng: g
        });
        return k
    };
    UI.showHireStaff = function (a, b) {
        var c = $("#hireStaffDialog"),
            d = UI._generateJobApplicants(),
            f = c.find(".applicantSliderContainer"),
            g = n(f, d);
        c.find(".okButton").clickExclOnce(function () {
            var a = c.find(".rsActiveSlide").find(".staffName").text(),
                b = d.first(function (b) {
                    return b.name == a
                });
            UI._hireStaff(b);
            UI.closeModal()
        });
        f = {
            disableCheckForNotifications: !0,
            close: !0,
            onClose: function () {
                GameManager.uiSettings.findStaffData = void 0;
                VisualsManager.refreshHiringButtons();
                GameManager.removeFromActiveNotifications(a);
                GameManager.resume(!0);
                b && b()
            }
        };
        PlatformShim.ISWIN8 ? g.gdSlider() : f.onOpen = function () {
            g.gdSlider()
        };
        UI.showModalContent("#hireStaffDialog", f)
    };
    var n = function (a, b, c) {
        a.empty();
        c = $('<div class="applicantContainer royalSlider rsDefaultInv"></div>');
        a.append(c);
        a = $("#staffTemplate");
        for (var d = 0; d < b.length; d++) {
            var f = b[d],
                g = a.clone();
            g[0].id = void 0;
            g.find(".staffName").text(f.name);
            var k = f.experience ? LevelCalculator.getLevelFractional(f.experience) : 5 * f.qualityFactor;
            g.find(".staffQ").text("Level: ".localize() +
                Math.floor(k));
            g.find(".staffS").text(Math.floor(500 * f.speedFactor));
            var l = 500 * f.designFactor,
                m = 500 * f.technologyFactor;
            g.find(".staffD").text(Math.floor(l));
            g.find(".staffT").text(Math.floor(m));
            k = 100 / ((l + m) / l);
            l = 100 / ((l + m) / m);
            g.find(".staffDBar").css("width", k - 1 + "%");
            g.find(".staffTBar").css("width", l - 1 + "%");
            g.find(".staffR").text(Math.floor(500 * f.researchFactor));
            g.find(".staffSalary").text("{0} per month".localize().format(UI.getShortNumberString(f.salary)));
            c.append(g)
        }
        return c
    };
    UI._hireStaff =
        function (a) {
            var b = GameManager.company,
                c = 5 * a.qualityFactor,
                c = new Character({
                    id: GameManager.getGUID(),
                    name: a.name,
                    dF: a.designFactor,
                    tF: a.technologyFactor,
                    speedF: a.speedFactor,
                    qualityF: Math.floor(c) / 5,
                    experience: LevelCalculator.getXpForLevel(c),
                    researchF: a.researchFactor,
                    salary: a.salary,
                    efficiency: 0.05,
                    slot: GameManager.uiSettings.findStaffData.slot,
                    sex: a.sex
                });
            GameManager.setBodyAndHead(c);
            c.flags.hiredTimestamp = GameManager.gameTime;
            c.flags.nextVacation = GameManager.gameTime + 48E3 * GameManager.SECONDS_PER_WEEK;
            c.flags.workload = 0;
            GameManager.uiSettings.findStaffData = null;
            b.staff.forEach(function (a) {
                a.adjustEfficiency(-0.4)
            });
            b.staff.push(c);
            Tutorial.staffHired();
            GDT.fire(GameManager, GDT.eventKeys.gameplay.staffHired, {
                character: c,
                applicant: a
            });
            VisualsManager.reloadAllCharacters();
            GameManager.company.staff[GameManager.company.staff.length - 1].startAnimations();
            Research.checkForNewResearch();
            VisualsManager.addComputer(c);
            VisualsManager.refreshHiringButtons();
            VisualsManager.refreshTrainingOverlays();
            2 < GameManager.company.staff.length &&
                GameManager.enableMediumContracts();
            UI.reset();
            a.isFamous && Achievements.activate(Achievements.hireSomeoneFamous)
        };
    UI.showFireStaffPrompt = function (a) {
        GameManager.company.notifications.insertAt(0, DecisionNotifications.fireEmployee.getNotification(GameManager.company, a))
    };
    UI.showStaffList = function (a) {
        var b = $("#staffListDialog"),
            c = b.find(".staffSliderContainer"),
            d = n(c, GameManager.company.staff);
        b.find(".okButton").clickExclOnce(function () {
            UI.closeModal()
        });
        b = {
            disableCheckForNotifications: !1,
            close: !0,
            onClose: function () {
                a && a()
            }
        };
        PlatformShim.ISWIN8 ? d.gdSlider() : b.onOpen = function () {
            d.gdSlider()
        };
        UI.showModalContent("#staffListDialog", b)
    };
    var r = "Sip Meyer;Christoph Sowyer;James E. Garmack;Johnny Rome;James Di Margiti;Mick Brash;David Draben;Hasir Nebelli;Andres Lamot;Scott Rro;Ben Silverman;Martin Person;Tom References".split(";"),
        p = "Jerry Sole;Richard Chariott;Bill Bright;Christian Robertson;Eric Robertson;Dennis Avelone;Drew Darpyshyn;David Drossman;Peter Polynox;Migeru Mayomoto;Tom Schofer;Ron Raglow;Eduard McGillen;Markus Stonefeather;Bill J. Allen;Jona Chen;Paul Reed;James Romeo".split(";"),
        s = "Warden Vector;Ricky Rartle;Leeroy Rubshaw;Kevin Flin;Ralph Koster;Joe Smodley;Jack Long;Allen Low;Clinton Harris;Arthur Bee;Phillip Fesh;Paul Pres;Kyle Stabler;Ronny Garmel;Dennis Habbabis;Chris Maley;Mark Torris;Tony Rodriguez;Arnt Johnson;Dino Watty".split(";"),
        u = "Dana Benten;Anna Eastfall;Corinne Jo;Anne Kitnis;Tomara Minar;Jane Lean;Caroline Saw;Timea Habori;Laura Bridge;Raddy Janenova;Amy Philipa;Zoe Zamms".split(";"),
        t = "Erica Robinson;Kim Swoft;Brenda Wrathbate;Robin Kunecke;Amy Nenning;Tracey Halferton;Yoko Hanno;Laura Brenda;Amanda Triggs;Kiri Wolftill;Lucy Broadshaw;Aurelia Dupont;Riana Ratchett".split(";"),
        q = "Jane Janeson;Cherie Ray Garner;Jade Haymond;Kelly Santareno;Joan Red;Susie Manly;Emilia Ridgepath;Pauline Zobeck;Rina Brok;Jennifer Cavanagh;Beverly Larand;Laureen Kamo;Heather Hailey".split(";"),
        v = "Mary Patricia Linda Barbara Elizabeth Jennifer Susan Margaret Dorothy Liza Nancy Karen Betty Helen Sandra Donna Carol Ruth Sharon Michelle Laura Sarah Kimberly Deborah Jessica Shirley Cynthia Angela Melissa Brenda Amy Anna Rebecca Virginia Kathleen Pamela Martha Debra Amanda Stephanie Carolyn Christine Marie Janet Catherine Frances Ann Joyce Diane Alice Julie Heather Teresa Doris Gloria Evelyn Jean Cheryl Katherine Joan Ashley Judith Rose Janice Kelly Nicole Judy Christina Kathy Theresa Beverly Denise Tammy Irene Jane Lori Rachel Marilyn Andrea Kathryn Louise Sara Anne Jacqueline Wanda Bonnie Julia Ruby Lois Tina Phyllis Norma Paula Diana Annie Lillian Emily Robin Peggy Crystal Gladys Rita Dawn Connie Florence Tracy Edna Tiffany Carmen Rosa Cindy Grace Wendy Victoria Edith Kim Sherry Sylvia Josephine Thelma Shannon Ethel Ellen Elaine Marjorie Carrie Charlotte Monica Esther Pauline Emma Juanita Anita Rhonda Hazel Amber Eva Debbie April Leslie Clara Lucille Jamie Joanne Eleanore Valerie Danielle Megan Alicia Suzanne Michele Gail Bertha Darlene Veronica Jill Erin Lauren Cathy Joann Lorraine Lynn Sally Regina Erica Beatrice Dolores Bernice Audrey Yvonne Annette June Samantha Marion Dana Stacy Ana Renee Ida Vivian Roberta Holly Brittany Melanie Loretta Yolanda Jeanette Laurie Katie Kristen Vanessa Alma Sue Elsie Beth".split(" "),
        A = "Jacob Michael Joshua Matthew Daniel Christopher Andrew Ethan Joseph William Anthony David Alexander Nicholas Ryan Tyler James John Jonathan Noah Brandon Christian Dylan Samuel Benjamin Nathan Zachary Logan Justin Gabriel Jose Austin Kevin Elijah Caleb Robert Thomas Jordan Cameron Jack Hunter Jackson Angel Isaiah Evan Isaac Mason Luke Jason Gavin Jayden Aaron Connor Aiden Aidan Kyle Juan Charles Luis Adam Lucas Brian Eric Adrian Nathaniel Sean Alex Carlos Ian Bryan Owen Landon Julian Chase Cole Diego Jeremiah Steven Sebastian Xavier Timothy Carter Wyatt Brayden Blake Hayden Devin Cody Richard Seth Dominic Jaden Antonio Miguel Liam Patrick Carson Jesse Tristan Alejandro Henry Victor Trevor Bryce Jake Riley Colin Jared Jeremy Mark Caden Garrett Parker Marcus Vincent Kaleb Kaden Brady Colton Kenneth Joel Oscar Josiah Jorge Cooper Ashton Tanner Eduardo Paul Edward Ivan Preston Maxwell Alan Levi Stephen Grant Nicolas Omar Dakota Alexis George Collin Eli Spencer Gage Max Cristian Ricardo Derek Micah Brody Francisco Nolan Ayden Dalton Shane Peter Damian Jeffrey Brendan Travis Fernando Peyton Conner Andres Javier Giovanni Shawn Braden Jonah Bradley Cesar Emmanuel Manuel Edgar Erik Mario Edwin Johnathan Devon Erick Wesley Oliver Trenton Hector Malachi Jalen Raymond Gregory Abraham Elias Leonardo Sergio Donovan Colby Marco Bryson Martin".split(" "),
        z = "Smith Johnson Williams Jones Brown Davis Miller Wilson Moore Taylor Anderson Thomas Jackson White Harris Martin Thompson Garcia Martinez Robinson Clark Rodriguez Lewis Lee Walker Hall Allen Young Hernandez King Wright Lopez Hill Scott Green Adams Baker Gonzalez Nelson Carter Mitchell Perez Roberts Turner Phillips Campbell Parker Evans Edwards Collins Stewart Sanchez Morris Rogers Reed Cook Morgan Bell Murphy Bailey Rivera Cooper Richardson Cox Howard Ward Torres Peterson Gray Ramirez James Watson Brooks Kelly Sanders Price Bennett Wood Barnes Ross Henderson Coleman Jenkins Perry Powell Long Patterson Hughes Flores Washington Butler Simmons Foster Gonzales Bryant Alexander Russell Griffin Diaz Hayes Myers Ford Hamilton Graham Sullivan Wallace Woods Cole West Jordan Owens Reynolds Fisher Ellis Harrison Gibson Mcdonald Cruz Marshall Ortiz Gomez Murray Freeman Wells Webb Simpson Stevens Tucker Porter Hunter Hicks Crawford Henry Boyd Mason Morales Kennedy Warren Dixon Ramos Reyes Burns Gordon Shaw Holmes Rice Robertson Hunt Black Daniels Palmer Mills Nichols Grant Knight Ferguson Rose Stone Hawkins Dunn Perkins Hudson Spencer Gardner Stephens Payne Pierce Berry Matthews Arnold Wagner Willis Ray Watkins Olson Carroll Duncan Snyder Hart Cunningham Bradley Lane Andrews Ruiz Harper Fox Riley Armstrong Carpenter Weaver Greene Lawrence Elliott Chavez Sims Austin Peters Kelley Franklin Lawson Fields Gutierrez Ryan Schmidt Carr Vasquez Castillo Wheeler Chapman Oliver Montgomery Richards Williamson Johnston Banks Meyer Bishop Mccoy Howell Alvarez Morrison Hansen Fernandez Garza Harvey Little Burton Stanley Nguyen George Jacobs Reid Kim Fuller Lynch Dean Gilbert Garrett Romero Welch Larson Frazier Burke Hanson Day Mendoza Moreno Bowman Medina Fowler Brewer Hoffman Carlson Silva Pearson Holland Douglas Fleming Jensen Vargas Byrd Davidson Hopkins May Terry Herrera Wade Soto Walters Curtis Neal Caldwell Lowe Jennings Barnett Graves Jimenez Horton Shelton Barrett Obrien Castro Sutton Gregory Mckinney Lucas Miles Craig Rodriquez Chambers Holt Lambert Fletcher Watts Bates Hale Rhodes Pena Beck Newman Haynes Mcdaniel Mendez Bush Vaughn Parks Dawson Santiago Norris Hardy Love Steele Curry Powers Schultz Barker Guzman Page Munoz Ball Keller Chandler Weber Leonard Walsh Lyons Ramsey Wolfe Schneider Mullins Benson Sharp Bowen Daniel Barber Cummings Hines Baldwin Griffith Valdez Hubbard Salazar Reeves Warner Stevenson Burgess Santos Tate Cross Garner Mann Mack Moss Thornton Dennis Mcgee Farmer Delgado Aguilar Vega Glover Manning Cohen Harmon Rodgers Robbins Newton Todd Blair Higgins Ingram Reese Cannon Strickland Townsend Potter Goodwin Walton Rowe Hampton Ortega Patton Swanson Joseph Francis Goodman Maldonado Yates Becker Erickson Hodges Rios Conner Adkins Webster Norman Malone Hammond Flowers Cobb Moody Quinn Blake Maxwell Pope Floyd Osborne Paul Mccarthy Guerrero Lindsey Estrada Sandoval Gibbs Tyler Gross Fitzgerald Stokes Doyle Sherman Saunders Wise Colon Gill Alvarado Greer Padilla Simon Waters Nunez Ballard Schwartz Mcbride Houston Christensen Klein Pratt Briggs Parsons Mclaughlin Zimmerman French Buchanan Moran Copeland Roy Pittman Brady Mccormick Holloway Brock Poole Frank Logan Owen Bass Marsh Drake Wong Jefferson Park Morton Abbott Sparks Norton Huff Clayton Massey Lloyd Figueroa Carson Bowers Roberson Barton Tran Lamb Harrington Casey Boone Cortez Clarke Mathis Singleton Wilkins Cain Bryan Underwood Hogan Mckenzie Collier Luna Phelps Mcguire Allison Bridges Wilkerson Nash Summers Atkins".split(" ");
    UI.getRandomMaleFirstName = function () {
        return A.pickRandom()
    };
    UI.getRandomFemaleFirstName = function () {
        return v.pickRandom()
    }
})();
(function () {
    UI._resetBoostUI = function () {
        b()
    };
    UI._resetCallbacks.push(UI._resetBoostUI);
    var a = [],
        b = function () {
            $(".charBoost").remove();
            a = [];
            for (var b = VisualsManager.characterOverlays, c = 0; c < b.length; c++) {
                var m = b[c];
                if (0 != m.character.maxBoostLevel) {
                    var l = f(m.x, m.y);
                    m.boostButton = l;
                    (function (a, b) {
                        b.clickExcl(function () {
                            if (!a.onFire && 1 === a.boostRechargeProgress || 1 <= a.boostLevel) Sound.playSoundOnce("boost", 0.065), a.activateBoost(), b.find(".boostButton").removeClass("enabled"), b.enabled = !1;
                            window.event.cancelBubble = !0
                        })
                    })(m.character, l)
                }
            }
        },
        c = ["#00698C", "#007CA5", "#008FBF", "#00A2D8", "deepskyBlue"];
    GameManager.addTickListener(function (a) {
        if (a = VisualsManager.characterOverlays)
            for (var b = 0; b < a.length; b++) {
                var f = a[b],
                    l = f.character,
                    g = f.boostButton;
                if (g) {
                    var n = 0,
                        r = l.boostLevel;
                    l.onFire ? n = l.boostRechargeProgress : (n = l.boostRechargeProgress, (1 == n || 1 <= r) && !g.enabled && (g.find(".boostButton").addClass("enabled"), g.enabled = !0));
                    if (g.boostLevel !== r || g.onFire !== l.onFire) {
                        g.onFire = l.onFire;
                        r ? g.levelElement.text("x" + r) : g.levelElement.text("");
                        g.boostLevel = r;
                        var p, s;
                        switch (r) {
                            case 1:
                                p = c[1];
                                s = c[0];
                                break;
                            case 2:
                                p = c[2];
                                s = c[1];
                                break;
                            case 3:
                                p = c[3];
                                s = c[2];
                                break;
                            case 4:
                                p = c[4];
                                s = c[3];
                                break;
                            case 5:
                                c[4];
                                c[4];
                                break;
                            default:
                                p = c[0], s = "transparent"
                        }
                        f.boostVisual.fgColor = p;
                        f.boostVisual.bgColor = s;
                        f.boostVisual.invalidate()
                    }
                    g.boostValue != n && (f.boostVisual.updateValue(360 * n), f.boostVisual.invalidate())
                }
            }
    }, !0);
    var f = function (b, c) {
        var f = $("#boostButtonTemplate").clone();
        f[0].id = void 0;
        var l = GameFlags.IS_LOW_RES ? -3 : 0;
        f.css({
            position: "absolute",
            top: c + VisualsManager.toScreenCoordinates(-3,
                CanvasManager.globalScale) + "px",
            left: b + VisualsManager.toScreenCoordinates(159 + l, CanvasManager.globalScale) + "px"
        });
        f.addClass("charBoost");
        f.levelElement = f.find(".boostMultiplier");
        $("#canvasContainer").append(f);
        a.push(f);
        return f
    }
})();
(function () {
    UI.showGenericProjectWindow = function (a) {
        var b = General.getAvailableProjects(GameManager.company, a);
        if (b && b.length) {
            a = $("#genericProjectMenu");
            var c = {
                close: !0
            },
                f = a.find(".genericProjectSliderContainer");
            f.empty();
            var d = $('<div class="projectSlider royalSlider rsDefaultInv"></div>');
            f.append(d);
            for (var f = $("#genericProjectTemplate"), k = 0; k < b.length; k++) {
                var m = b[k],
                    l = f.clone();
                l[0].id = void 0;
                l.find(".projectTitle").text(m.name);
                l.find(".projectIcon").attr("src", m.iconUri);
                l.find(".projectDescription").text(m.description);
                l.find(".projectPointCost").text("Project Size: ".localize() + m.pointsCost);
                d.append(l)
            }
            PlatformShim.ISWIN8 ? d.gdSlider() : c.onOpen = function () {
                d.gdSlider()
            };
            a.find(".okButton").clickExcl(function () {
                Sound.click();
                var a = $(".simplemodal-data").find(".projectSlider").find(".rsActiveSlide").find(".projectTitle").text(),
                    c = b.first(function (b) {
                        return b.name == a
                    });
                c && (GameManager.startProject(c), UI.closeModal())
            });
            UI.showModalContent("#genericProjectMenu", c)
        }
    }
})();
(function () {
    var a = function (a) {
        if ("gameContract" === a.type) return b(a);
        var c = $("#contractTemplate").clone();
        c.removeAttr("id");
        c.find(".contract.name").text(a.name);
        var k = UI._getMaxFontSize("bold {0}pt {1}", UI.IS_SEGOE_UI_INSTALLED ? "Segoe UI" : "Open Sans", 26, 7, 460, 60, [a.name]);
        26 > k && c.find(".contract.name").css("font-size", k + "pt");
        c.find(".sliderTabCaption").append($("<span>{0}</span>".format(a.shortName ? a.shortName : a.name)));
        c.find(".contract.description").html(UI.getHtmlText(a.description));
        a.payment &&
            c.find(".contract.payment").text("Pay: {0}".localize().format(UI.getShortNumberString(a.payment)));
        a.penalty && c.find(".contract.penalty").text("Penalty: {0}".localize().format(UI.getShortNumberString(a.penalty)));
        a.requiredD && c.find(".contract.designPoints").text(a.requiredD);
        a.requiredT && c.find(".contract.technologyPoints").text(a.requiredT);
        a.weeksToFinish && c.find(".contract.duration").text("{0} weeks".localize().format(a.weeksToFinish));
        a.size && ("medium" === a.size ? (c.find(".contract.designPoints").addClass("medium"),
            c.find(".contract.technologyPoints").addClass("medium")) : "large" === a.size && (c.find(".contract.designPoints").addClass("large"), c.find(".contract.technologyPoints").addClass("large")));
        return c
    },
        b = function (a) {
            var b = $("#gameContractTemplate").clone();
            b.removeAttr("id");
            b.find(".contract.name").text(a.name);
            if (a.topic) {
                var c = Topics.topics.first(function (b) {
                    return b.id === a.topic
                }); - 1 == GameManager.company.topics.indexOf(c) && (b.find(".contract.topicNotResearched").text("{0} not researched".localize().format(c.name)),
                    a.disabled = !0)
            }
            b.find(".sliderTabCaption").append($("<span>{0}</span>".format(a.shortName ? a.shortName : a.name)));
            b.find(".contract.description").html(UI.getHtmlText(a.description));
            c = "Min Score: {0}".localize().format(a.minScore);
            a.gameSize && (c += "\n" + "Game Size:".localize() + " " + General.getGameSizeLabel(a.gameSize));
            a.gameAudience && (c += "\n" + "Target Audience:".localize() + " " + General.getAudienceLabel(a.gameAudience));
            b.find(".contract.reqs").html(UI.getHtmlText(c));
            b.find(".contract.royaltyRate").text("Royalties: {0}%".localize().format(Math.floor(100 *
                a.royaltyRate)));
            b.find(".contract.payment").text("Up-front Pay: {0}".localize().format(UI.getShortNumberString(a.payment)));
            b.find(".contract.penalty").text("Penalty: {0}".localize().format(UI.getShortNumberString(a.penalty)));
            if (a.platform) {
                var m = Platforms.allPlatforms.first(function (b) {
                    return b.id === a.platform
                });
                if (m) {
                    c = Platforms.getPlatformImage(m, GameManager.company.currentWeek);
                    b.find(".contract.platform").attr("src", c);
                    var c = -1 != GameManager.company.licencedPlatforms.indexOf(m),
                        l = m.name;
                    c ||
                        (l += " (no license)".localize(), a.disabled = !0, a.tryEnable = function (b) {
                            if (a.topic) {
                                var c = Topics.topics.first(function (b) {
                                    return b.id === a.topic
                                });
                                if (-1 == GameManager.company.topics.indexOf(c)) return !1
                            }
                            UI.buyPlatform(m.name, b);
                            return !1
                        });
                    b.find(".contract.platformLabel").text(l);
                    c || b.find(".contract.platformLabel").addClass("red")
                }
            }
            return b
        },
        c;
    UI.showFindContractWorkMenu = function (b, d) {
        var k = GameManager.company;
        c = ProjectContracts.getAvailable(k, GameManager.uiSettings.selectedContractType);
        if (0 == c.length) k.activeNotifications.remove(b),
            k.notifications.push(new Notification("Contracts".localize("heading"), "There are no contracts currently available.".localize(), {
                type: NotificationType.AutoPopup
            })), GameManager.showPendingNotifications(d);
        else {
            var m = $("#findContractWorkWindow"),
                k = m.find("#contractSliderContainer");
            k.empty();
            for (var l = $('<div class="contractSlider royalSlider rsDefaultInv"></div>'), g = 0; g < c.length; g++) {
                var n = a(c[g]);
                n.append('<div class="cardId" style="display:none">{0}</div>'.format(g));
                l.append(n)
            }
            k.append(l);
            m.find(".okButton").clickExcl(function () {
                Sound.click();
                var a = l.find(".rsActiveSlide").find(".cardId").text();
                if (void 0 != a) {
                    var b = c[parseInt(a)];
                    b && (b.disabled ? b.tryEnable ? b.tryEnable(function () {
                        m.dialog("close");
                        GameManager.startContract(b)
                    }) : m.find(".okButton").parent().effect("shake", {
                        times: 2,
                        distance: 5
                    }, 50) : (m.dialog("close"), GameManager.startContract(b)))
                }
            });
            PlatformShim.ISWIN8 && l.gdSlider();
            m.gdDialog({
                close: !0,
                onClose: function () {
                    GameManager.removeFromActiveNotifications(b);
                    GameManager.resume(!0);
                    d && d()
                },
                onOpen: function () {
                    PlatformShim.ISWIN8 || l.gdSlider()
                }
            })
        }
    }
})();
(function () {
    var a = [],
        b = [];
    UI.resetAchievementsUI = function () {
        a.forEach(function (a) {
            a.remove()
        });
        a = [];
        b = [];
        UI._achievementsActiveTimeModifier = 1
    };
    UI._resetCallbacks.push(UI.resetAchievementsUI);
    UI._achievementsActiveTimeModifier = 1;
    UI.showAchievements = function (c) {
        var f = GameManager.gameId,
            m = 200,
            l = $("<div></div>");
        l.css("font-size", 1).animate({
            "font-size": 0
        }, {
            duration: 200,
            easeing: "easein",
            step: function (a, b) {
                GameManager.gameId == f && (UI._achievementsActiveTimeModifier = a)
            }
        });
        setTimeout(function () {
            Sound.pauseAllLoopingFx()
        },
            m);
        for (var g = 0; g < c.length; g++) {
            var n = c[g];
            if (-1 == b.indexOf(n.id)) {
                b.push(n.id);
                var r = $(document.body),
                    p = $("#achievementTemplate").clone().hide();
                p.removeAttr("id");
                var s = document.body.clientWidth,
                    u = document.body.clientHeight;
                p.css({
                    position: "absolute",
                    "z-index": 5E4,
                    top: -u
                });
                n.tint && (p.find(".tint").css("color", n.tint), p.find(".backgroundTint").css("background", n.tint));
                r.append(p);
                var r = p.width(),
                    t = p.height();
                p.find(".title").text(n.title).hide().css("margin-left", -s / 2 - r);
                p.find(".descr").text(n.description).hide().css("margin-left",
                    s + r);
                s /= 2;
                u /= 2;
                s -= r / 2;
                u -= t / 2;
                (function (c, d, g) {
                    c.delay(g).queue(function () {
                        Sound.playSoundOnce("achievement1", 0.3);
                        c.show().transition({
                            left: s,
                            top: u
                        }, 200, "out");
                        c.find(".achievement.unlocked").transition({
                            "margin-top": -25,
                            delay: 200
                        }, 200, "out");
                        c.find(".title").show().transition({
                            "margin-left": 0,
                            delay: 500
                        }, 200, "out");
                        c.find(".descr").show().transition({
                            "margin-left": 0,
                            delay: 700
                        }, 200, "out");
                        c.find(".sliceGlow").transition({
                            "margin-left": -230,
                            opacity: 0,
                            delay: 200
                        }, 800).transition({
                            "margin-left": 120,
                            opacity: 0.5
                        },
                            400, "out").transition({
                                "margin-left": 230,
                                opacity: 0
                            }, 800, "out");
                        setTimeout(function () {
                            c.find(".achievement.innerContainer").addClass("hideState");
                            setTimeout(function () {
                                c.remove();
                                GameManager.gameId == f && (a.remove(c), b.remove(d.id), Achievements.complete(d))
                            }, 400)
                        }, 4E3);
                        $(this).dequeue()
                    })
                })(p, n, m);
                a.push(p);
                m += 4200
            }
        }
        l.delay(m).animate({
            "font-size": 1
        }, {
            duration: 200,
            easeing: "easein",
            step: function (a, b) {
                GameManager.gameId == f && (UI._achievementsActiveTimeModifier = a)
            }
        });
        setTimeout(function () {
            Sound.resumeAllLoopingFx()
        },
            m + 200)
    };
    var c = function (a) {
        if (UI.isPanelOpen()) return UI.closePanels(), !1
    };
    UI._isAchievementsPanelVisible = !1;
    UI.toggleAchievementPanel = function () {
        UI._isHighScorePanelVisible && UI.toggleHighScorePanel();
        var a = $("#achievementsPanel");
        a.hasClass("hidden") ? (f(a.find(".achievementsContainer")), a.show().removeClass("hidden").addClass("show"), $("#gameContainerWrapper").focus(), a.delay(400).queue(function () {
            UI.overrideClick = c;
            GameManager.pause(!0, !0);
            $(this).dequeue()
        }), UI._isAchievementsPanelVisible = !0) : (a.removeClass("show").addClass("hidden"),
            UI.overrideClick = null, UI._isAchievementsPanelVisible = !1, GameManager.resume(!0, !0), a.delay(400).queue(function () {
                $(this).hide();
                $(this).dequeue()
            }))
    };
    var f = function (a) {
        a.empty();
        for (var b = Achievements.getAllItems().filter(function (a) {
            return Achievements.hasAchieved(a) || !a.hidden
        }), c = [], f = [], g = 0; g < b.length; g++) {
            var n = b[g];
            Achievements.hasAchieved(n) ? c.push(n) : f.push(n)
        }
        b = c.concat(f);
        f = $("#achievementTemplate");
        f = f.clone();
        f.find(".achievement.unlocked").remove();
        f.find(".achievement.dismiss").remove();
        for (g = 0; g < b.length; g++) {
            var n = b[g],
                r = g < c.length,
                p = f.clone();
            p.removeAttr("id");
            p.find(".title").text(n.title);
            p.find(".descr").text(n.description);
            n.tint && (p.find(".tint").css("color", n.tint), p.find(".backgroundTint").css("background", n.tint));
            r || p.find(".achievement").addClass("disabled");
            a.append(p)
        }
        UI.createDraggable(a)
    }
})();
(function () {
    UI.closePanels = function () {
        UI._isHighScorePanelVisible && UI.toggleHighScorePanel();
        UI._isAchievementsPanelVisible && UI.toggleAchievementPanel()
    };
    UI.isPanelOpen = function () {
        return UI._isHighScorePanelVisible || UI._isAchievementsPanelVisible
    };
    UI._isHighScorePanelVisible = !1;
    var a = function (a) {
        if (UI.isPanelOpen()) return UI.closePanels(), !1
    },
        b = function (a) {
            a = a.find(".highScoreContainer");
            a.empty();
            var b = DataStore.getHighScoreList(),
                b = b.slice().sort(function (a, b) {
                    return b.score - a.score
                });
            if (0 == b.length) a.append($("<p>" +
                "No scores yet. Once you finish a game your high score will be listed here.".localize() + "</p>"));
            else {
                for (var d = $('<div class="highScoreItem"><div class="highScoreItemNname"></div><div class="score"></div></div>'), k = 0; k < b.length; k++) {
                    var m = b[k],
                        l = d.clone();
                    l.find(".highScoreItemNname").text(m.name);
                    l.find(".score").text(UI.getLongNumberString(m.score));
                    a.append(l)
                }
                UI.createDraggable(a)
            }
        };
    UI.toggleHighScorePanel = function () {
        UI._isAchievementsPanelVisible && UI.toggleAchievementPanel();
        var c = $("#highScorePanel");
        c.hasClass("hidden") ? (b(c), c.show().removeClass("hidden").addClass("show"), $("#gameContainerWrapper").focus(), c.delay(400).queue(function () {
            UI.overrideClick = a;
            GameManager.pause(!0, !0);
            $(this).dequeue()
        }), UI._isHighScorePanelVisible = !0) : (c.removeClass("show").addClass("hidden"), UI.overrideClick = null, UI._isHighScorePanelVisible = !1, GameManager.resume(!0, !0), c.delay(400).queue(function () {
            $(this).hide();
            $(this).dequeue()
        }))
    }
})();
(function () {
    UI.showReviewWindow = function (b, c) {
        var d = $("#reviewWindow");
        d.find("#reviewAnimationContainer").empty();
        d.find(".okButton").hide().clickExclOnce(function () {
            k = [];
            m = [];
            UI.closeModal(c)
        });
        UI.showModalContent("#reviewWindow", {
            disableCheckForNotifications: !0,
            onOpen: function () {
                a()
            },
            onClose: function () {
                GameManager.company.activeNotifications.remove(b)
            }
        })
    };
    var a = function () {
        k = [];
        m = [];
        for (var a = $(".simplemodal-data"), c = a.find("#reviewAnimationContainer"), n = GameManager.company.gameLog.last(), r = $("#reviewItemTemplate"),
            p = "Reviews for {0}".localize().format(n.title), s = a.find(".windowTitle").text(p).typewrite({
                type: "return-tween",
                delay: 20,
                soundLoop: "notificationTyping",
                volume: 0.12
            }), p = 20 * p.length, u = 0; u < n.reviews.length; u++) {
            var t = r.clone(),
                q = n.reviews[u];
            t.removeAttr("id");
            t.scoreElement = t.find(".score").css("opacity", 0);
            t.find(".score .stars").css("opacity", 0);
            t.find(".score .award").css("opacity", 0);
            t.scoreContainer = t.find(".scoreContainer");
            t.textElement = t.find(".text").css("opacity", 0);
            t.reviewerElement = t.find(".reviewer").css("opacity",
                0);
            Localization.isRTLLanguage() ? t.css({
                right: 60,
                top: 20 + 120 * u
            }) : t.css({
                left: 60,
                top: 20 + 120 * u
            });
            c.append(t);
            p += b(t, q, p)
        }
        f = 1;
        $(window).on("click", d);
        s.wait(p).call(function () {
            $(window).off("click", d);
            a.find(".okButton").slideDown()
        });
        k.push(s)
    },
        b = function (a, b, d) {
            var f = Localization.isRTLLanguage(),
                p = [],
                s = createjs.Tween.get(a).wait(d);
            a.scoreElement.opacity = 0;
            f ? (a.find(".award").attr("src", "images/misc/icon_starlarge_rtl.png"), a.find(".star.full").attr("src", "images/misc/icon_starfull_rtl.png"), a.find(".star.half").attr("src",
                "images/misc/icon_starhalf_rtl.png"), a.scoreContainer.marginRight = 0) : a.scoreContainer.marginLeft = 0;
            a.find(".starsEmpty").hide();
            var u = createjs.Tween.get(a.scoreElement).wait(d).to({
                opacity: 1
            }),
                t;
            t = f ? createjs.Tween.get(a.scoreContainer).wait(d).to({
                marginRight: Math.floor(80 * Math.random())
            }, 7E3) : createjs.Tween.get(a.scoreContainer).wait(d).to({
                marginLeft: Math.floor(80 * Math.random())
            }, 7E3);
            var q = c(a.scoreElement, b.score, s);
            p.addRange([s, u, t]);
            s.call(function () {
                8 <= b.score && (a.find(".score").css("font-weight",
                    500), a.find(".text").css("font-weight", 600))
            });
            var v = !1,
                A = ["star-m3", "star-m2", "star", "star-p2", "star-p3"];
            a.find(".star").css({
                opacity: 0
            });
            for (var z = a.find(".star.full").css({
                opacity: 0
            }).hide(), B = a.find(".star.half").css({
                opacity: 0
            }).hide(), u = Math.floor(b.score / 2), s = 0; s < u; s++) {
                var D = $(z[s]);
                D.show();
                t = createjs.Tween.get(D).to({
                    opacity: 0,
                    scale: 1
                }).wait(q + d + 150 * s).call(function () {
                    v || (a.find(".starsEmpty").show(), v = !0)
                }).to({
                    opacity: 1
                }).to({
                    scale: 1.5
                }, 150).call(function () {
                    Sound.playSoundOnce(A.pickRandom(),
                        0.2)
                }).to({
                    scale: 1
                }, 150);
                m.push(D);
                p.push(t)
            }
            0 != b.score % 2 && 10 >= b.score && (z = $(B[u]), z.show(), t = createjs.Tween.get(z).to({
                opacity: 0,
                scale: 1
            }).wait(q + d + 150 * s).call(function () {
                v || (a.find(".starsEmpty").show(), v = !0)
            }).to({
                opacity: 1
            }).to({
                scale: 1.5
            }, 150).call(function () {
                Sound.playSoundOnce(A.pickRandom(), 0.18)
            }).to({
                scale: 1
            }, 150), m.push(z), p.push(t));
            s = a.find(".award").css("opacity", 0);
            10 <= b.score && (t = createjs.Tween.get(s).wait(q + d + 150 * u + 20).to({
                opacity: 1
            }), m.push(s), p.push(t));
            q += 150 * u + 20;
            u = a.textElement;
            f ? u.marginRight = 10 : u.marginLeft = 10;
            u.opacity = 0;
            u.text(b.message);
            s = 19;
            t = 40;
            do s -= 1, t = UI.getMeasuredHeight(b.message, s, 500); while (70 < t && 9 < s);
            44 < t && (u.css("transform", "translate(0px,20px)"), a.reviewerElement.css("transform", "translate(0px,10px)"));
            u.css("font-size", s + "pt");
            u.css("opactity", 0);
            t = Math.max(20 * b.message.length, 400);
            z = u.typewrite({
                delay: 20,
                wait: d + q - 400,
                type: "return-tween",
                soundLoop: "notificationTyping",
                volume: 0.12
            });
            s = f ? createjs.Tween.get(u).wait(d + q - 400).to({
                marginRight: 40,
                opacity: 1
            }, 400,
                createjs.Ease.sineOut) : createjs.Tween.get(u).wait(d + q - 400).to({
                    marginLeft: 40,
                    opacity: 1
                }, 400, createjs.Ease.sineOut);
            q += t;
            p.addRange([z, s]);
            m.push(u);
            q += 500;
            u = a.reviewerElement;
            f ? u.marginLeft = 30 : u.marginRight = 30;
            u.opacity = 0;
            s = "... {0}".format(b.reviewerName);
            u.text(s);
            u.css("opactity", 0);
            B = Math.max(20 * s.length, 400);
            z = u.typewrite({
                delay: 20,
                wait: d + q - 400,
                type: "return-tween",
                soundLoop: "notificationTyping",
                volume: 0.12
            });
            s = f ? createjs.Tween.get(u).wait(d + q - 400).to({
                marginLeft: -30,
                opacity: 1
            }, 400, createjs.Ease.sineOut) :
                createjs.Tween.get(u).wait(d + q - 400).to({
                    marginRight: -30,
                    opacity: 1
                }, 400, createjs.Ease.sineOut);
            q += B;
            p.addRange([z, s]);
            m.push(u);
            k.addRange(p);
            m.push(a.scoreElement.show());
            m.push(a.scoreContainer);
            s.wait(t + B).call(function () {
                for (var b = 0; b < p.length; b++) - 1 != k.indexOf(p[b]) && k.remove(p[b]); - 1 != m.indexOf(a.scoreElement) && m.remove(a.scoreElement)
            });
            return q
        },
        c = function (a, b, c) {
            for (var d = 0, f = GameManager.gameId, k = 0; 45 > k; k++)(function (a, k) {
                d += a / 4 * 20;
                c = c.wait(a / 4 * 20).call(function () {
                    if (f == GameManager.gameId) {
                        var c;
                        c = (a + 1) / 45;
                        1 == c ? c = b : (c = b + 9 * Math.random() * (1 - c) * Math.randomSign(), c = Math.floor(c).clamp(1, 10));
                        k.textValue != c && Sound.playSoundOnce("reviewTack", 0.15);
                        k.textValue = c
                    }
                })
            })(k, a);
            return d += 300
        },
        f = 1,
        d = function () {
            f = (f + 0.5).clamp(1, 3)
        },
        k = [],
        m = [];
    GameManager.addTickListener(function (a) {
        if (0 != k.length || 0 != m.length) {
            for (var b = 0; b < m.length; b++) {
                var c = m[b];
                c.textValue != c.currentText && (c.text(c.textValue), c.currentText = c.textValue);
                c.scale != c.currentScale && (c.css("transform", "scale({0})".format(c.scale)), c.currentScale =
                    c.scale);
                c.opacity != c.currentOpacity && (c.css("opacity", c.opacity), c.currentOpacity = c.opacity);
                c.marginLeft != c.currentMarginLeft && (c.css("margin-left", c.marginLeft), c.currentMarginLeft = c.marginLeft);
                c.marginRight != c.currentMarginRight && (c.css("margin-right", c.marginRight), c.currentMarginRight = c.marginRight)
            }
            for (b = 0; b < k.length; b++) k[b].tick(a * f)
        }
    }, !1)
})();
(function () {
    var a;
    UI.isMenuOpen = function () {
        return void 0 != a
    };
    UI.showContextMenu = function (c, k, m) {
        if (c && 0 != c.length) {
            a && UI.closeContextMenu(a);
            var l = $("<div id='contextMenu'></div>");
            b(l, c);
            c = $("body");
            l.hide();
            c.append(l);
            var g = l.width(),
                n = l.height(),
                r = k.x - g / 4,
                p = k.y - n - 5;
            m && "rightStack" == m.position && (r = k.x + 25, p = k.y - 10);
            r = r.clamp(0, c.width() - g);
            p = p.clamp(0, c.height() - n);
            l.css({
                position: "absolute",
                left: r,
                top: p
            });
            l.show();
            f(l, !0)
        }
    };
    var b = function (a, b) {
        for (var f = $("#contextMenuItemTemplate"), l = 0; l < b.length; l++) {
            var g =
                b[l],
                n = f.clone();
            n.removeAttr("id");
            n.find(".label").text(g.label);
            g.icon ? (n.find(".icon").attr("src", g.icon), g.iconStyleClass && n.find(".icon").addClass(g.iconStyleClass), g.icon.startsWith("./images/context menu icons") && c(n.find(".icon"))) : n.find(".icon").attr("display", "hidden");
            (function (b) {
                n.clickExclOnce(function () {
                    UI.closeContextMenu(a);
                    b.action()
                })
            })(g);
            a.append(n)
        }
    },
        c = function (a, b) {
            var c = a.attr("id"),
                f = a.attr("class"),
                g = a.attr("src");
            jQuery.get(g, function (b) {
                b = jQuery(b).find("svg");
                "undefined" !==
                    typeof c && (b = b.attr("id", c));
                "undefined" !== typeof f && (b = b.attr("class", f + " replaced-svg"));
                b = b.removeAttr("xmlns:a");
                a.replaceWith(b)
            }, "xml")
        },
        f = function (b, c, f) {
            var l = $.makeArray(b.children());
            c || l.reverse();
            for (var g = 0; g < l.length; g++)(function (a) {
                b.delay(100).queue(function () {
                    c ? a.removeClass("hideState").addClass("showState") : a.removeClass("showState").addClass("hideState");
                    $(this).dequeue()
                })
            })($(l[g]));
            f && b.delay(600).queue(function () {
                f();
                $(this).dequeue()
            });
            c && (a = b)
        };
    UI.closeContextMenu = function (b,
        c) {
        b || (b = a);
        a === b && (a = null);
        b && f(b, !1, function () {
            b.remove()
        })
    }
})();
(function () {
    UI.showSupportUsOptionsWindow = function (a, b) {
        var c = $("#supporterDialog");
        c.find(".rateAndReview").clickExcl(function () {
            Sound.click();
            ghg4.ghg5("supporter:rate/review clicked");
            PlatformShim.goToReviewPage()
        });
        c.find(".sendFeedback").clickExcl(function () {
            Sound.click();
            ghg4.ghg5("supporter:send feedback clicked");
            Windows.System.Launcher.launchUriAsync(new Windows.Foundation.Uri("mailto:support@greenheartgames.com?Subject=Game%20Dev%20Tycoon")).done()
        });
        c.find(".okButton").clickExclOnce(function () {
            Sound.click();
            c.dialog("close")
        });
        c.find(".packOptions").hide();
        DataStore.remoteSettings.supporterPacksEnabled && SupportPacks.getPacks(function (a) {
            a = a.productListings;
            var b = 0;
            if (a.hasOwnProperty("1")) {
                var k = a["1"];
                (function (a) {
                    var b = c.find(".pack1");
                    b.text(a.name + " ({0})".format(a.formattedPrice)).clickExcl(function () {
                        Sound.click();
                        ghg4.ghg5("supporter:pack 1 clicked");
                        SupportPacks.buy(a.name, function () {
                            b.text(a.name + " ({0}) - purchased!".localize().format(a.formattedPrice)).effect("pulsate", {
                                times: 2
                            })
                        })
                    })
                })(k);
                b++
            }
            a.hasOwnProperty("2") && (k = a["2"], function (a) {
                var b = c.find(".pack2");
                b.text(a.name + " ({0})".format(a.formattedPrice));
                b.clickExcl(function () {
                    Sound.click();
                    ghg4.ghg5("supporter:pack 2 clicked");
                    SupportPacks.buy(a.name, function () {
                        b.text(a.name + " ({0}) - purchased!".localize().format(a.formattedPrice)).effect("pulsate", {
                            times: 2
                        })
                    })
                })
            }(k), b++);
            (2 == b || GameFlags.ghg6) && c.find(".packOptions").fadeIn()
        });
        c.gdDialog({
            popout: !0,
            close: !0,
            onClose: function () {
                a && GameManager.removeFromActiveNotifications(a);
                GameManager.resume(!0);
                b && b()
            }
        })
    }
})();
(function (a) {
    var b = [],
        c;
    GameManager.addTickListener(function (a) {
        if (0 != b.length) {
            if (isNaN(c) || 0 === c) c = 1;
            a *= c;
            if (0 !== a)
                for (var d = 0; d < b.length; d++) b[d].tick(a, !1)
        }
    }, !1);
    a.fn.typewrite = function (f) {
        f || (f = {});
        var d = Localization.isRTLLanguage(),
            k = {
                selector: this,
                delay: 100,
                speedUpOnClick: !1,
                callback: null,
                animateScroll: !0,
                scrollPadding: 25,
                scrollPollIntervalInChars: 50
            };
        f && a.extend(k, f);
        d && (k.delay *= 5, k.scrollPollIntervalInChars /= 5);
        c = 1;
        var m = GameManager.gameId,
            l = function (a) {
                GameManager.gameId == m && (c = (c + 2.5).clamp(1,
                    10))
            };
        if (f.speedUpOnClick) {
            var g = k.callback;
            k.callback = function () {
                a(window).off("click", l);
                g()
            }
        }
        for (var n = a(k.selector), r = n.text().replaceAll("<br />", "\n"), p = a("<span></span>"), s = {}, u = "", t = 0; t < r.length; t++)
            if (u += r[t], "[" == u) {
                var q = r.substr(t);
                q.startsWith("[pause:") ? (u = t + 7, t = r.indexOf("]", u), u = r.substr(u, t - u), s[p.children().length] = {
                    type: "pause",
                    value: parseFloat(u)
                }, u = "") : q.startsWith("[delay:") && (u = t + 7, t = r.indexOf("]", u), u = r.substr(u, t - u), s[p.children().length] = {
                    type: "delay",
                    value: u
                }, u = "")
            } else "\n" ==
                u ? (p.append(a("<br />")), u = "") : d ? " " == r[t] && (p.append(a("<span></span>").text(u)), u = "") : (p.append(a("<span></span>").text(u)), u = "");
        "" != u && p.append(a("<span></span>").text(u));
        var v = [];
        p.children().each(function () {
            a(this).css({
                opacity: 0
            })
        });
        n.empty();
        n.append(p);
        var A = 0,
            z = 0,
            B = 0,
            D = p.children().length,
            E = n.parent();
        p.children().each(function (b) {
            (function (a, b) {
                v.push(function () {
                    b.css({
                        opacity: 1
                    });
                    if (k.animateScroll && (B++ >= k.scrollPollIntervalInChars - 1 || a == D - 1)) {
                        B = 0;
                        0 == z && (z = n.height());
                        var c = k.scrollPadding +
                            b.position().top - n.position().top - z;
                        0 < c && A < c && (E.stop().animate({
                            scrollTop: c
                        }, 600), A = c)
                    }
                })
            })(b, a(this))
        });
        var w = createjs.Tween.get(n);
        f.wait && (w = w.wait(f.wait));
        f.soundLoop && (w = w.call(function () {
            Sound.playSoundLoop(f.soundLoop, f.volume)
        }));
        d = 1;
        for (t = 0; t < v.length; t++) {
            if (s.hasOwnProperty(t))
                if ("pause" == s[t].type) {
                    w = w.call(function () {
                        f.soundLoop && Sound.stopSound(f.soundLoop)
                    }).wait(s[t].value).call(function () {
                        f.soundLoop && Sound.playSoundLoop(f.soundLoop, f.volume)
                    }).call(v[t]);
                    continue
                } else "delay" ==
                    s[t].type && (d = "slow" == s[t].value ? 10 : 1);
            w = w.wait(k.delay * d).call(v[t])
        }
        w.call(function () {
            f.soundLoop && Sound.stopSound(f.soundLoop);
            "return-tween" != f.type && -1 != b.indexOf(w) && b.remove(w);
            k.callback && k.callback()
        });
        if ("return-tween" === f.type) return w;
        setTimeout(function () {
            b.push(w);
            if (k.speedUpOnClick) a(window).on("click", l)
        }, k.delay)
    }
})(jQuery);
(function () {
    UI.showPostMortemComplete = function (b, c) {
        GameManager.company.activeNotifications.remove(b);
        var f = GameManager.company.getGameById(b.text);
        if (f) {
            for (var d = a(f), k, m = "", l = 0, g = 0; g < d.length; g++, l++) {
                var n = d[g];
                k || (k = n.category);
                k != n.category && (m += "{n}" + "We have some additional insights:".localize() + "\n", l = 0, k = n.category);
                0 < g && (m += "[pause:500]");
                m += "\n{0}. {1}".format(l + 1, d[g].msg)
            }
            0 === d.length && (m = "No new insights".localize());
            GameManager.company.notifications.push(new Notification("Game Report".localize(),
                "Our post-release analysis of {0} is complete and we got the following results:".localize().format(f.title) + "\n" + m, {
                type: NotificationType.GameReports
            }))
        }
        GameManager.resume(!0);
        c && c()
    };
    var a = function (a) {
        var c = GameManager.company,
            f = [],
            d = "1";
        if (!Knowledge.hasComboKnowledge(c, a)) {
            var k = Knowledge.getComboHintText(a);
            Knowledge.setComboKnowledge(c, a);
            var m = "{0} and {1} is a {2} combination.".localize().format(a.topic.name, a.getGenreDisplayName(), k),
                m = m.replace("a okay", "an okay");
            f.push({
                category: d,
                msg: m
            })
        }
        m =
            a.featureLog.filter(function (a) {
                return "mission" === a.missionType
            }).filter(function (d) {
                return !Knowledge.hasMissionWeightingKnowledge(c, d, a, !1)
            });
        if (0 < m.length) {
            var l = [m.pickRandom()];
            1 < m.length && 0.9 < c.getRandom() && l.push(m.except(l).pickRandom());
            for (m = 0; m < l.length; m++) {
                var g = l[m];
                General.getGameSizeDurationFactor(a.gameSize);
                var n = Missions.getGenreWeighting(g, a),
                    r = Missions.getMissionWithId(g.id),
                    k = Knowledge.getMissionWeightingDisplayText(n, !0),
                    n = "{0} seems to be {1} for this type of game.".localize().format(r.name,
                        k);
                f.push({
                    category: d,
                    msg: n
                });
                Knowledge.setMissionWeightingKnowledge(c, g, a)
            }
        }
        for (m = 0; m < a.platforms.length; m++) {
            var p = a.platforms[m],
                s = a.genre;
            if (!Knowledge.hasPlatformGenreWeightingKnowledge(c, p, s) && (n = GameGenre.getGenreWeighting(p.genreWeightings, s), l = 0.2, 0.7 >= n ? l = 1 : (g = c.gameLog.count(function (c) {
                return c.platforms.first(function (c) {
                    return c.id == p.id && a.genre.id == s.id
                })
            }) - 1, l += 0.4 * g), c.getRandom() < l)) {
                Knowledge.setPlatformGenreWeightingKnowledge(c, p, s);
                k = Knowledge.getFactorAdj(n, !0);
                f.push({
                    category: d,
                    msg: "Platform genre-match ({0}/{1}): {2}.".localize().format(p.name, s.name, k)
                });
                break
            }
        }
        if (c.canSetTargetAudience()) {
            for (var u = a.targetAudience, m = 0; m < a.platforms.length; m++)
                if (p = a.platforms[m], !Knowledge.hasPlatformAudienceWeightingKnowledge(c, p, u) && (n = Platforms.getAudienceWeighting([p], u, !0), l = 0.2, 0.7 >= n ? l = 1 : (g = c.gameLog.count(function (c) {
                    return c.platforms.first(function (c) {
                        return c.id == p.id && a.targetAudience == u
                    })
                }) - 1, l += 0.4 * g), c.getRandom() < l)) {
                    Knowledge.setPlatformAudienceWeightingKnowledge(c,
                        p, u);
                    k = Knowledge.getFactorAdj(n, !0);
                    f.push({
                        category: d,
                        msg: "Platform audience-match ({0}/{1}): {2}.".localize().format(p.name, General.getAudienceLabel(u), k)
                    });
                    break
                } var t = a.topic;
            Knowledge.hasTopicAudienceWeightingKnowledge(c, t, u) || (n = General.getAudienceWeighting(t.audienceWeightings, u), l = 0.2, 0.7 >= n ? l = 1 : (g = c.gameLog.count(function (a) {
                return a.topic.id == t.id && a.targetAudience == u
            }) - 1, l += 0.4 * g), c.getRandom() < l && (Knowledge.setTopicAudienceWeightingKnowledge(c, t, u), k = Knowledge.getFactorAdj(n, !0), f.push({
                category: d,
                msg: "Topic audience-match ({0}/{1}): {2}.".localize().format(t.name, General.getAudienceLabel(u), k)
            })))
        }
        d = "2";
        a.flags.sameGenreTopic && f.push({
            category: d,
            msg: "The market really doesn't like when we publish very similar games too close to each other.".localize()
        });
        if (a.flags.newStaffIds && (l = a.flags.newStaffIds.map(function (a) {
            return GameManager.company.staff.first(function (b) {
                return b.id == a
            })
        }).filter(function (a) {
            return a
        }), 0 < l.length)) {
            n = l[0].name;
            for (m = 1; m < l.length; m++) n += ", {0}".format(l[m].name);
            m = 1 == l.length ? "{0} is still new to the team.".localize("{0} is a single name").format(n) : "{0} are still new to the team.".localize("{0} is a list of names").format(n);
            m += " " + "A few more games and the team will have higher potential".localize();
            f.push({
                category: d,
                msg: m
            })
        }
        1 < c.staff.length && a.flags.teamContribution && 0.8 >= a.flags.teamContribution && f.push({
            category: d,
            msg: "We should try to focus our entire team on the development of a game.".localize()
        });
        "small" != a.gameSize && (a.flags.royaltyRate && a.flags.fansAtLaunch >
            Sales.getTargetFans(c, a) ? 0.2 > c.getRandom() && f.push({
                category: d,
                msg: "Our fan base is big enough to make self-publishing {0} games viable. Unless a publishing deal gives us a great royalty rate we are likely better off publishing {0} games ourselves".localize().format(General.getGameSizeLabel(a.gameSize))
            }) : !a.flags.royaltyRate && a.flags.fansAtLaunch < Sales.getTargetFans(c, a) && 0.2 > c.getRandom() && f.push({
                category: d,
                msg: "Self-publishing {1} games will be most efficient when we have at least {0} fans. Publishing deals can give us great exposure and help us reach more players.".localize().format(UI.getShortNumberString(Sales.getTargetFans(c,
                    a)), General.getGameSizeLabel(a.gameSize))
            }));
        if (c.flags.pirateMode && (d = "3", f.push({
            category: d,
            msg: "Approximately {0}% of players pirated {1}.".localize("{0} is a number, {1} is game title").format(Math.floor(a.flags.piracyRate), a.title)
        }), 0 != a.flags.drmStrength)) {
            switch (a.flags.drmStrength) {
                case 1:
                    k = "acceptable".localize();
                    break;
                case 2:
                    k = "excellent".localize();
                    break;
                case -1:
                    k = "inadequate".localize()
            }
            k && f.push({
                category: d,
                msg: "The effectiveness of our copy protection technology was {0}.".localize().format(k)
            })
        }
        return f
    }
})();
(function () {
    var a;
    UI.showNewsletterWidget = function () {
        if (!UI.isNewsletterWidgetDisabled()) {
            var a = GameManager.getSaveGames();
            a && a.first(function (a) {
                return a && a.currentWeek && 3 < Company.getDate(a.currentWeek).year
            }) && UI._showNewsletterWidget()
        }
    };
    UI.isNewsletterWidgetDisabled = function () {
        return DataStore.getValue("isNewsletterWidgetDisabled")
    };
    UI.disableNewsletterWidget = function () {
        DataStore.setValue("isNewsletterWidgetDisabled", !0)
    };
    UI._showNewsletterWidget = function () {
        a = $("#newsletterSignup");
        a.clearQueue();
        showing = !0;
        a.find(".newsletterIconText").removeAttr("style").text("Sign up to our newsletter".localize());
        a.find(".deleteButton").clickExcl(function () {
            UI.disableNewsletterWidget();
            a.transit({
                opacity: 0
            }, 400);
            setTimeout(function () {
                a.hide()
            }, 400)
        });
        a.find(".orangeButton").clickExcl(function () {
            b(a)
        });
        a.find("input").on("focus", function (b) {
            $(document).click(function (b) {
                a.removeClass("active");
                b.stopPropagation()
            });
            a.click(function (a) {
                a.stopPropagation()
            })
        });
        a.on("mouseenter mouseleave touchstart", function (a) {
            a =
                $(this).find("input").is(":focus") || "mouseenter" === a.type || "touchstart" === a.type;
            $(this).toggleClass("active", a)
        });
        0 < a.length && (a.css("opacity", 0).show(), a.transit({
            opacity: 1
        }, 400))
    };
    UI.closeNewsletterWidget = function () {
        a && a.hide()
    };
    var b = function (a) {
        a.removeClass("active").off("mouseenter mouseleave touchstart").find(".newsletterIconText").text("Signing up...".localize()).css({
            width: "auto",
            "margin-right": "10px"
        });
        a.children().effect("pulsate", {
            times: 10
        }, 1500);
        var b = a.find("input").val();
        $.ajax({
            type: "GET",
            url: "http://greenback.greenheartgames.com/api/newsletter/subscribe",
            data: {
                list: "bpgZ4tZtAeBVss3M0t0PSA",
                email: b,
                "boolean": "true"
            },
            cache: !1
        }).complete(function (b) {
            b = b.responseText;
            a.children().stop(!0, !0).css("opacity", "");
            "1" == b ? (a.find(".newsletterIconText").text("Signup successful!".localize()).typewrite({
                delay: 20
            }), a.css("color", "darkgreen"), setTimeout(function () {
                a.children().effect("pulsate", {
                    times: 2
                }, 400)
            }, 1500), setTimeout(function () {
                a.transit({
                    opacity: 0
                }, 500).hide();
                UI.disableNewsletterWidget()
            },
                2500)) : (a.find(".newsletterIconText").text(b).typewrite({
                    delay: 20
                }), a.css("color", "red"), setTimeout(function () {
                    a.children().effect("pulsate", {
                        times: 2
                    }, 400)
                }, 1500), setTimeout(function () {
                    a.find(".newsletterIconText").text("");
                    a.removeAttr("style");
                    UI._showNewsletterWidget()
                }, 2500))
        })
    }
})();
(function () {
    function a(a) {
        var b = $("<div>"),
            d = a.length - 1;
        a.filter(function (a, c) {
            var l = "{0} - {1}({2}) - {3}".format(a.name, a.author, a.id, "Version: {0}".localize().format(a.version)),
                g = $(".modMismatchModItem").clone();
            g.text(a.name);
            g.attr("title", l);
            d != c ? g.append(", ") : g.append(" ");
            b.append(g)
        });
        return b
    }

    function b(b, f) {
        var d = $("#modMismatchDialog").clone();
        if (0 < b.length) {
            var k = $("#modMismatchTextMissingMods").clone();
            k.append(a(b));
            k.appendTo(d.find("#modMismatchModPrintout"))
        }
        0 < f.length && (k = $("#modMismatchTextAdditionalMods").clone(),
            k.append(a(f)), k.appendTo(d.find("#modMismatchModPrintout")));
        0 < f.length && 0 < b.length && d.find("#modMismatchTextMissingMods").after("<br/>");
        return d
    }
    UI.showModMismatchDialog = function (a, f, d) {
        if (1 > f.length && 1 > d.length) return a();
        var k = b(f, d);
        k.gdDialog({
            close: !1,
            zIndex: 8E3,
            onOpen: function () {
                UI.disableMainMenu();
                k.find(".confirmActionButton").clickExclOnce(function () {
                    Sound.click();
                    a();
                    k.dialog("close");
                    k.dialog("destroy").remove()
                });
                k.find(".cancelActionButton").clickExclOnce(function () {
                    Sound.click();
                    SplashScreen.reshow();
                    k.dialog("close");
                    k.dialog("destroy").remove()
                })
            },
            onClose: function () {
                UI.enableMainMenu();
                k.dialog("destroy").remove()
            }
        })
    }
})();
(function () {
    UI._prepareGreenworks = function () {
        if (GameFlags.IS_STEAM && Greenworks && Greenworks.available) {
            var a = $("#modsPanel");
            a.find("#modsPanelActions").show();
            var b = a.find("#modsPanelButtonMods"),
                c = a.find("#modsPanelButtonWorkshop"),
                f = a.find("#modsPanelButtonUpload"),
                d = a.find("#modsPanelButtonPublishNow"),
                k = a.find("#modsPanelButtonUpdate"),
                m = a.find("#modsPanelButtonUpdateNow"),
                l = a.find("#ugcModFolder"),
                g = a.find("#ugcModFolderName"),
                n = a.find("#ugcModTitle"),
                r = a.find("#ugcModDesc"),
                p = a.find("#ugcModImageName"),
                s = a.find("#ugcModImage"),
                u = a.find("#ugcModImagePreview"),
                t = a.find("#ugcModFolderUpd"),
                q = a.find("#ugcModFolderNameUpd"),
                v = a.find("#ugcModTitleUpd"),
                A = a.find("#ugcModDescUpd"),
                z = a.find("#ugcModImageNameUpd"),
                B = a.find("#ugcModImageUpd"),
                D = a.find("#ugcModImagePreviewUpd"),
                E = a.find("#modsPanelWorkshopUpdateInputFields"),
                w = a.find("#ugcMods"),
                F = a.find("#browseForButtonUpload"),
                C = a.find("#browseForImageButtonUpload"),
                J = a.find("#browseForButtonUpdate"),
                K = a.find("#browseForImageButtonUpdate"),
                L = a.find(".ugcModUploadInputFieldR"),
                H = a.find(".ugcModUpdateInputFieldR"),
                G = a.find("#modsPanelUploadStatus"),
                I = a.find("#modsPanelUploadStatusUpd"),
                N = a.find(".modsPanelItem"),
                O = a.find("#modsPanelMods"),
                M = a.find("#modsPanelUpload"),
                R = a.find("#modsPanelUpdate"),
                S = a.find(".workshoplegalagreement"),
                a = a.find(".moddinglegalagreement"),
                Q = !1,
                P = !1;
            b.clickExcl(function () {
                Sound.click();
                N.hide();
                O.show()
            });
            c.clickExcl(function () {
                Sound.click();
                Greenworks.showOverlay()
            });
            f.clickExcl(function () {
                Sound.click();
                N.hide();
                M.show()
            });
            k.clickExcl(function () {
                Sound.click();
                N.hide();
                R.show();
                W(w);
                V(!1);
                V(!0);
                w.append($(document.createElement("li")).text("Please wait...".localize()));
                ba()
            });
            F.clickExcl(function () {
                Sound.click();
                l.click()
            });
            C.clickExcl(function () {
                Sound.click();
                s.click()
            });
            J.clickExcl(function () {
                Sound.click();
                t.click()
            });
            K.clickExcl(function () {
                Sound.click();
                B.click()
            });
            L.bind("change focus input click", function (a) {
                T(!1)
            });
            H.bind("change focus input click", function (a) {
                T(!0)
            });
            S.clickExcl(function () {
                PlatformShim.openUrlExternal("http://steamcommunity.com/sharedfiles/workshoplegalagreement")
            });
            a.clickExcl(function () {
                PlatformShim.openUrlExternal("http://www.greenheartgames.com/legal/game-dev-tycoon-modding-agreement/")
            });
            l.bind("change focus input click", function (a) {
                var b = $(this).val();
                g.val(b);
                "change" === a.type && (G.text("Reading package.json...".localize()), (a = Greenworks.readPackageJsonAsObject(b)) ? (Q = !0, n.val(a.name), r.val(a.description), G.text("Idle".localize())) : (Q = !1, G.text("Error. Invalid Game Dev Tycoon Mod!".localize())), T(!1))
            });
            t.bind("change input focus click", function (a) {
                var b =
                    $(this).val();
                q.val(b);
                "change" === a.type && (I.text("Reading package.json...".localize()), Greenworks.readPackageJsonAsObject(b) ? (P = !0, I.text("Idle".localize())) : (P = !1, I.text("Error. Invalid Game Dev Tycoon Mod!".localize())), T(!0))
            });
            s.bind("change input focus click", function () {
                p.val($(this).val());
                u.attr("src", $(this).val())
            });
            B.bind("change input focus click", function () {
                z.val($(this).val());
                D.attr("src", $(this).val())
            });
            var W = function (a) {
                a.children().each(function (a) {
                    0 <= a && $(this).remove()
                })
            },
                U = function (a) {
                    a.children().each(function (a) {
                        0 <=
                            a && $(this).removeClass("selected")
                    })
                },
                V = function (a) {
                    a ? (v.val(""), A.val(""), t.val(""), q.val(""), B.val(""), z.val(""), D.attr("src", ""), P = !1, T(!0)) : (n.val(""), r.val(""), l.val(""), g.val(""), s.val(""), p.val(""), u.attr("src", ""), Q = !1, T(!1))
                },
                Z = function (a, b) {
                    a ? !0 === b ? m.hasClass("modsPanelWorkshopButtoDisabled") && m.removeClass("modsPanelWorkshopButtoDisabled").addClass("modsPanelWorkshopButton") : d.hasClass("modsPanelWorkshopButtoDisabled") && d.removeClass("modsPanelWorkshopButtoDisabled").addClass("modsPanelWorkshopButton") :
                        !0 === b ? m.hasClass("modsPanelWorkshopButton") && m.removeClass("modsPanelWorkshopButton").addClass("modsPanelWorkshopButtoDisabled") : d.hasClass("modsPanelWorkshopButton") && d.removeClass("modsPanelWorkshopButton").addClass("modsPanelWorkshopButtoDisabled")
                },
                Y = function (a, b) {
                    b ? a ? (v.is(":disabled") && v.removeAttr("disabled"), A.is(":disabled") && A.removeAttr("disabled"), B.is(":disabled") && B.removeAttr("disabled"), t.is(":disabled") && t.removeAttr("disabled"), w.find("li").each(function () {
                        $(this).text($(this).attr("wstitle"))
                    }),
                        w.find("#wsModPleaseWait").remove()) : (v.attr("disabled", !0), A.attr("disabled", !0), B.attr("disabled", !0), t.attr("disabled", !0), w.find("li").each(function () {
                            $(this).text("")
                        }), w.append($(document.createElement("li")).text("Please wait...".localize()).attr("id", "wsModPleaseWait"))) : a ? (n.is(":disabled") && n.removeAttr("disabled"), r.is(":disabled") && r.removeAttr("disabled"), s.is(":disabled") && s.removeAttr("disabled"), l.is(":disabled") && l.removeAttr("disabled")) : (n.attr("disabled", !0), r.attr("disabled",
                            !0), s.attr("disabled", !0), l.attr("disabled", !0))
                },
                T = function (a) {
                    var b = !1;
                    a ? b = P : (b = "" != n.val().trim() && Q, b &= "" != l.val().trim());
                    Z(b, a)
                };
            W(w);
            V(!1);
            V(!0);
            w.append($(document.createElement("li")).text("Please wait...".localize()));
            E.css("opacity", "0");
            var ba = function () {
                Z(!1, !0);
                Greenworks.getPublishedItems(function (a) {
                    if (a) {
                        W(w);
                        for (var b = 0; b < a.length; b++) {
                            var c = a[b],
                                c = $(document.createElement("li")).text(c.title).attr({
                                    wsTitle: c.title,
                                    wsDesc: c.description,
                                    wsId: c.publishedFileId,
                                    wsFile: Greenworks.extractFilename(c.fileName,
                                        !1)
                                }).addClass("workshopItem active").css({
                                    display: "block"
                                });
                            c.clickExcl(function () {
                                V(!0);
                                var a = $(this).attr("wsId"),
                                    b = $(this).attr("wsTitle"),
                                    c = $(this).attr("wsDesc");
                                $(this).attr("wsFile");
                                U(w);
                                $(this).addClass("selected");
                                v.val(b);
                                A.val(c);
                                E.css("opacity", 0 < a.length ? "1" : "0")
                            });
                            w.append(c)
                        }
                        1 > a.length ? w.append($(document.createElement("li")).text("No Mods found.".localize())) : w.children().first().click()
                    }
                    T(!0)
                })
            },
                aa = function (a, b) {
                    if (!0 !== X) {
                        X = !0;
                        Z(!1, b);
                        Y(!1, b);
                        var c = [],
                            d = "";
                        b || ("" == l.val().trim() &&
                            c.push("Folder".localize()), "" == n.val().trim() && c.push("Title".localize()));
                        var f = b ? I : G;
                        if (0 >= c.length)
                            if (d = b ? "Updating...".localize() : "Publishing...".localize(), f.text(d), b) {
                                var g = w.find("li.selected").attr("wsId");
                                Greenworks.createArchiveAndPublishUpdate({
                                    name: v.val(),
                                    desc: A.val(),
                                    image: B.val(),
                                    folder: t.val(),
                                    pid: g,
                                    createImage: !0,
                                    updateJson: !0
                                }, function (a) {
                                    f.text(a)
                                }, function () {
                                    f.text("Update done".localize());
                                    T(!0);
                                    Y(!0, !0);
                                    X = !1;
                                    setTimeout(function () {
                                        f.text("Idle".localize())
                                    }, 2500);
                                    Greenworks.showOverlay(g)
                                })
                            } else Greenworks.createArchiveAndPublish({
                                name: n.val(),
                                desc: r.val(),
                                image: s.val(),
                                folder: l.val(),
                                createImage: !0,
                                updateJson: !0
                            }, function (a) {
                                f.text(a)
                            }, function (a) {
                                f.text("Publish done".localize());
                                T(!1);
                                Y(!0, !1);
                                X = !1;
                                V(!1);
                                setTimeout(function () {
                                    f.text("Idle".localize())
                                }, 2500);
                                Greenworks.showOverlay(a.id)
                            });
                        else d = "Error. Missing {0}".localize().format(c.join(", ")), f.text(d), T(b), Y(!0, b), X = !1, setTimeout(function () {
                            f.text("Idle".localize())
                        }, 2500)
                    }
                },
                X = !1;
            d.clickExcl(function () {
                $(this).hasClass("modsPanelWorkshopButtoDisabled") || (Sound.click(), aa(this,
                    !1))
            });
            m.clickExcl(function () {
                $(this).hasClass("modsPanelWorkshopButtoDisabled") || (Sound.click(), aa(this, !0))
            });
            N.hide();
            O.show();
            T(!1);
            T(!0)
        }
    }
})();
(function () {
    Media.TriggerNotifications = [{
        id: "mediumFansTargetReached",
        trigger: function (a) {
            return a.canDevelopMediumGames() && a.fans > Sales.MediumTargetFans
        },
        notification: new Notification("Goal reached".localize("heading"), "You now have more than {0} fans! With such a big fan base you should now be able to self-publish medium games.".localize().format(UI.getLongNumberString(Sales.MediumTargetFans)), {
            type: NotificationType.CompanyMilestones
        })
    }, {
        id: "largeFansTargetReached",
        trigger: function (a) {
            return a.canDevelopLargeGames() &&
                a.fans > Sales.LargeTargetFans
        },
        notification: new Notification("Goal reached".localize("heading"), "You now have more than {0} fans! With such a big fan base you should now be able to self-publish large games.".localize().format(UI.getLongNumberString(Sales.LargeTargetFans)), {
            type: NotificationType.CompanyMilestones
        })
    }, {
        id: "gameConvention",
        trigger: function (a) {
            return 1 < a.currentLevel && a.isLaterOrEqualThan(8, 2, 1)
        },
        getNotification: function (a) {
            return new Notification("Game Convention".localize(), "Dear {0},\nWe have followed your progress in recent years and would like to extend this formal invitation to participate in the biggest game convention on the planet 'Games, Games, Games' also known as G3.{n}By having your own company booth at G3 you can gain a lot of fans and hype for your games and we think our audience would love to see you there.\nWe will contact you yearly with booth options. Hope to see you at G3.\nThe G3 committee.".localize().format(a.name), {
                previewImage: "./images/notificationIcons/icon_notification_convention.png",
                type: NotificationType.CompanyMilestones
            })
        }
    }, {
        id: "level2Guide",
        notification: new Notification("Goal Hint".localize("heading"), "If you have more than 1M in cash you will be able to move to the next level. This might sound a lot but don't worry. Once you release a hit game you will get to this amount easily.".localize(), {
            type: NotificationType.AutoPopup
        }),
        trigger: function (a) {
            return 1 === a.currentLevel && 1E6 > a.cash && a.isLaterOrEqualThan(4,
                7, 2)
        }
    }, {
        id: "engineHint",
        trigger: function (a) {
            return a.isLaterOrEqualThan(3, 1, 2) && 0 === a.engines.length
        },
        notification: new Notification("Engine Reminder".localize("heading"), "Don't forget creating custom game engines. This will improve your games a lot! You can create your custom engine through the action menu once you have researched the Custom Engine.".localize(), {
            type: NotificationType.AutoPopup
        })
    }, {
        id: "thankYou",
        trigger: function (a) {
            return !PlatformShim.ISWIN8 && !GameManager.ghg2() && a.isLaterOrEqualThan(1,
                12, 3) && !DataStore.getValue("thankYouMessageShown")
        },
        getNotification: function (a) {
            DataStore.setValue("thankYouMessageShown", !0);
            return UI.getThanksForPurchasingNotification(a.staff[0].name)
        }
    }, {
        id: "publisherUnlock",
        trigger: function (a) {
            return a.canDevelopMediumGames()
        },
        getNotification: function (a) {
            a = "Hi {0},\nI have followed the progress of {1} for a while and it seems that with your recent expansion you have started developing larger games.\nLarger games deserve to be seen by more people and this is where a publisher can come in handy.{n}A publisher will market and publish your game around the world. They will also help fund development. In return they keep most of the profits but since the game will sell a lot more it is usually still worth it.{n}I can put you in touch with some publishers so you can look at some of the available contracts. Just let me know.\nJasmine Droke{n}Find Publishing Contract has been unlocked. It is accessible in the action menu.".localize().format(a.staff[0].name,
                a.name);
            a = new Notification({
                header: "Publishing Contracts".localize("heading"),
                text: a,
                type: NotificationType.CompanyMilestones
            });
            a.setFlag("publishersEnabled", !0);
            return a
        }
    }, {
        id: "multiplatformOptimizationUnlock",
        trigger: function (a) {
            return a.canDevelopMultiPlatform() && 1 < a.gameLog.count(function (b) {
                return 1 < b.platforms.length && (b.flags.postMortemCompleted || a.isLaterOrEqualThan(24, 2))
            })
        },
        getNotification: function (a) {
            a = "Looking at our past multi-platform games it becomes clear that we should be able to drastically reduce the cost of developing a single game for multiple platforms if we could better optimize our game engines for multi-platform development.".localize();
            a = new Notification({
                header: "New Insight".localize("heading"),
                text: a,
                weeksUntilFired: 2,
                type: NotificationType.CompanyMilestones
            });
            a.setFlag("multiPlatformOptimizeResearchAvailable", !0);
            return a
        }
    }]
})();

var WindowsIntegration = {};
(function () {
    if (PlatformShim.ISWIN8) {
        var a = WindowsIntegration,
            b = Windows.UI.Notifications.BadgeUpdateManager.createBadgeUpdaterForApplication(),
            c = "Player".localize();
        Windows.System.UserProfile.UserInformation.getDisplayNameAsync().then(function (a) {
            c = a
        });
        a.goToReviewPage = function () {
            var a = new Windows.Foundation.Uri("ms-windows-store:REVIEW?PFN={0}".format(Windows.ApplicationModel.Package.current.id.familyName));
            Windows.System.Launcher.launchUriAsync(a).done()
        };
        a.getUserName = function () {
            return c
        };
        $(document).ready(function () {
            $(document).find("#resumeCommandButton").hide();
            $(document).find("#gamePausedOverlay").hide()
        });
        a.onPause = function () {
            b.clear();
            var a = new Windows.Data.Xml.Dom.XmlDocument;
            a.loadXml('<badge version="1" value="paused"/>');
            b.update(new Windows.UI.Notifications.BadgeNotification(a));
            $(document).find("#pauseCommandButton").hide();
            $(document).find("#gamePausedOverlay").css({
                opacity: 0
            }).show().transit({
                opacity: 1
            });
            $(document).find("#resumeCommandButton").show()
        };
        a.onResume = function () {
            var a = new Windows.Data.Xml.Dom.XmlDocument;
            a.loadXml('<badge version="1" value="none"/>');
            b.update(new Windows.UI.Notifications.BadgeNotification(a));
            $(document).find("#pauseCommandButton").show();
            $(document).find("#gamePausedOverlay").transit({
                opacity: 0
            });
            $(document).find("#resumeCommandButton").hide()
        };
        var f = new Windows.Devices.Input.TouchCapabilities;
        a.isTouchCapable = f.touchPresent;
        var d = Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication();
        a.updateTile = function () {
            var a = Windows.UI.Notifications.TileUpdateManager.getTemplateContent(Windows.UI.Notifications.TileTemplateType.tileWideText01);
            if (!GameManager.company || 0 >= GameManager.company.gameLog.length) d.clear();
            else {
                var b = GameManager.company,
                    c = b.getBestSeller();
                c && (c = c.title);
                for (var f = a.getElementsByTagName("text"), b = [b.name, UI.getShortNumberString(b.cash) + " cash", UI.getShortNumberString(b.fans) + " fans", "Bestseller: " + c.title], c = 0; c < f.length; c++) f[c].appendChild(a.createTextNode(b[c]));
                a = new Windows.UI.Notifications.TileNotification(a);
                d.update(a)
            }
        };
        var k = function (a, b, c, d, f) {
            f || (f = 10);
            do {
                var g = b.format(c),
                    g = new createjs.Text(a, g, "black");
                c--
            } while (g.getMeasuredWidth() > d && c > f);
            return c
        },
            m, l, g = function (a) {
                var b = GameManager.company;
                if (b && 0 !== b.gameLog.length) {
                    var c = document.createElement("canvas");
                    c.width = 558;
                    c.height = 270;
                    m || (m = $('<img src="/images/active-tile.png" />'));
                    var d = function () {
                        var d = c.getContext("2d");
                        d.drawImage(m[0], 0, 0);
                        d.textAlign = "center";
                        var f = UI.IS_SEGOE_UI_INSTALLED ? "bold {0}pt Segoe UI" : "bold {0}pt Open Sans",
                            g = k(b.name, f, 40, 300);
                        d.fillStyle = "black";
                        d.font = f.format(g);
                        d.fillText(b.name, 370, 50);
                        var l = b.gameLog.slice().sort(function (a,
                            b) {
                            return b.unitsSold - a.unitsSold
                        }).first().title,
                            g = k(l, f, 22, 250);
                        d.font = f.format(g);
                        d.fillText(l, 370, 90);
                        l = UI.getShortNumberString(b.fans) + " fans";
                        g = k(l, f, 40, 290);
                        d.font = f.format(g);
                        d.fillText(l, 370, 160);
                        l = UI.getShortNumberString(b.cash) + " cash";
                        g = k(l, f, 32, 250);
                        d.font = f.format(g);
                        d.fillText(l, 370, 210);
                        l = "{0} Achievements unlocked!".format(Achievements.getAllItems().count(function (a) {
                            return Achievements.hasAchieved(a)
                        }));
                        g = k(l, f, 17, 250);
                        d.font = f.format(g);
                        d.fillText(l, 370, 250);
                        DataStore.saveCanvasToFile(c,
                            "active-tile.png", a)
                    };
                    m.complete ? d() : m.load(function () {
                        m.complete = !0;
                        d()
                    })
                }
            };
        a.updateImageTile = function () {
            if (!l) {
                l = !0;
                try {
                    g(function () {
                        try {
                            var a = Windows.UI.Notifications.TileUpdateManager.getTemplateContent(Windows.UI.Notifications.TileTemplateType.tileWideImage),
                                b = a.getElementsByTagName("image");
                            b[0].setAttribute("src", "ms-appdata:///images/logo-wide.png");
                            var c = new Windows.UI.Notifications.TileNotification(a);
                            n.update(c);
                            b[0].setAttribute("src", "ms-appdata:///local/active-tile.png");
                            c = new Windows.UI.Notifications.TileNotification(a);
                            n.update(c)
                        } catch (d) {
                            Logger.LogInfo("game tile update failed", d)
                        }
                        l = !1
                    })
                } catch (a) {
                    Logger.LogInfo("game tile update failed", a)
                }
            }
        };
        var n = Windows.UI.Notifications.TileUpdateManager.createTileUpdaterForApplication();
        a.showGetSteamKey = function () {
            var a = document.getElementById("steamkey");
            a.lastElementChild.innerText = "Get Steam Key".localize();
            a.disabled = !1
        };
        a.getSteamkey = function () {
            Windows.ApplicationModel.Store.CurrentApp.getAppReceiptAsync().done(function (a) {
                a = encodeURIComponent(a);
                PlatformShim.xhr({
                    type: "POST",
                    url: "http://customers.greenheartgames.com/winstore",
                    headers: {
                        "Content-type": "application/x-www-form-urlencoded"
                    },
                    data: "data=" + a
                }, function (a) {
                    if (a && a.responseText)
                        if ("INVALID" == a.responseText) WindowsIntegration.showGetSteamKey(), Logger.LogError("Could not verify app receipt", null, "Could not verify app receipt from Windows Store.".localize());
                        else try {
                            try {
                                var b = new Windows.Foundation.Uri(a.responseText)
                            } catch (c) {
                                WindowsIntegration.showGetSteamKey();
                                PlatformShim.alert(a.responseText, "Response");
                                return
                            }
                            Windows.System.Launcher.launchUriAsync(b).done();
                            WindowsIntegration.showGetSteamKey()
                        } catch (d) {
                            WindowsIntegration.showGetSteamKey(), Logger.LogError("Invalid response: " + a.responseText, d, "Could not verify app receipt from Windows Store.".localize())
                        } else WindowsIntegration.showGetSteamKey(), Logger.LogError("No response from server.", null, "No response from server. Please try again later.".localize())
                }, function (a) {
                    WindowsIntegration.showGetSteamKey();
                    Logger.LogError("Could not verify app receipt", null, "Could not verify app receipt from Windows Store.".localize() +
                        "\n" + a.statusText)
                })
            }, function (a) {
                WindowsIntegration.showGetSteamKey();
                Logger.LogError("Could not get app receipt", null, "Could not get app receipt from Windows Store.".localize() + "\n" + a.statusText)
            })
        }
    }
})();
var Tutorial = {};
(function () {
    var a = function (a) {
        return GameFlags.TUTORIAL_DISABLED ? !1 : SettingsGameplay.isTutorialOff() || !SettingsGameplay.alwaysShowTutorials() && -1 != DataStore.getTutorialSettings()["tutorials-shown"].indexOf(a) ? (b(a), !1) : -1 == GameManager.company.tutorialMessagesShown.indexOf(a)
    },
        b = function (a) {
            var b = DataStore.getTutorialSettings(); - 1 == GameManager.company.tutorialMessagesShown.indexOf(a) && GameManager.company.tutorialMessagesShown.push(a); - 1 == b["tutorials-shown"].indexOf(a) && (b["tutorials-shown"].push(a),
                DataStore.saveSettings())
        },
        c = function (c, d, f) {
            var k = c.id;
            c = c.msg;
            a(k) && (d || (d = 0), d = new Notification("Tutorial".localize(), c, "OK".localize(), d, {
                type: NotificationType.AutoPopup
            }), f && (d.image = f), GameManager.company.notifications.push(d), b(k))
        },
        f = WindowsIntegration.isTouchCapable ? "tap".localize("verb") : "click".localize("verb");
    Tutorial.getClickVerb = function () {
        return f
    };
    Tutorial.messages = {};
    var d = Tutorial.messages,
        k = function (a, b, c) {
            this.id = a;
            this.heading = b;
            this.msg = c
        };
    Tutorial.getAllShownMessages = function (a) {
        for (var b = [], c = 0; c < a.tutorialMessagesShown.length; c++) {
            var f = a.tutorialMessagesShown[c];
            d.hasOwnProperty(f) && b.push(d[f])
        }
        return b
    };
    d.createdCompany = new k("createdCompany", "Create a company".localize("heading"), "Congratulations!\nYou've just started your very own game development company!\nAt the moment your office is in a garage and you are the only employee but don't worry, many successful businesses have started out this way!{n}Let's start developing your first game.\nClose this message and then {0} anywhere on the screen to bring up the action menu.".localize("{0} click/touch verb").format(Tutorial.getClickVerb()));
    Tutorial.createdCompany = function () {
        c(d.createdCompany)
    };
    d.createGame = new k("createGame", "Create a game".localize("heading"), "Before development can begin you have to decide what kind of game you want to create and give your game a name.\nYou can also select which graphic technology your game should use.{n}Your options are initially limited but once you have a bit of experience you will be able to unlock new options.".localize());
    Tutorial.createGame = function () {
        c(d.createGame)
    };
    Tutorial.createSequel =
        function () { };
    d.gamePoints = new k("gamePoints", "Game points".localize("heading"), "Game development has now started.{n}While developing your game you will generate game points which you can see bubbling up.\nGame points are divided into design points and technology points. The more points you generate the better the game will be.{n}From time to time there will also be bug points generated. These points become less likely once you gain experience. Bugs should be fixed before the game is released and increase development time and cost.".localize());
    Tutorial.gamePoints = function () {
        c(d.gamePoints)
    };
    d.firstGameFinished = new k("firstGameFinished", "First game finished".localize("heading"), "After publishing a game you can invest a little bit of time to analyze your creation and generate a game report. Game reports are a great way to gain research points as well as valuable insights into what works and what doesn't work when developing a game.{n}To generate a game report close this message and then {0} anywhere on the screen to bring up the action menu.".localize("{0} click/touch verb").format(Tutorial.getClickVerb()));
    Tutorial.firstGameFinished = function (a) {
        c(d.firstGameFinished, a);
        GameManager.company.flags.pirateMode && c(d.pirateMode, a + 1)
    };
    var m = WindowsIntegration.isTouchCapable ? "swipe from the edge of the screen to bring up the app bar".localize("appbar fragment") : "right click to bring up the app bar".localize("appbar fragment"),
        l = WindowsIntegration.isTouchCapable ? "swipe from the right edge of the screen".localize("charmsbar fragment") : "bring your cursor to the top right corner of the screen and then move down.".localize("charmsbar fragment");
    d.appbarAndHelpWin8 = new k("appbarAndHelp", "Appbar and help menu".localize("heading"), "If you ever want to review the tutorial messages then you can do so in the Help menu. To access the Help menu and other features such as saving, loading and creating a game simply {0}.{n}You can also change game settings by using the Settings charm. To show the charms bar simply {1} You can then {2} on Settings.".localize("{0} is appbar fragment, {1} is charmsbar fragment, {2} is click/tap verb").format(m, l, Tutorial.getClickVerb()));
    d.mainMenu = new k("mainMenu", "Main Menu".localize("heading"), "If you ever want to review the tutorial messages then you can do so in the Help menu. To access the Help menu and other features such as saving, loading and creating a game simply press ESC to access the main menu.".localize());
    Tutorial.AppbarAndHelp = function () {
        PlatformShim.ISWIN8 ? c(d.appbarAndHelpWin8) : c(d.mainMenu)
    };
    d.contractsUnlocked = new k("contractsUnlocked", "Contracts unlocked".localize("heading"), "Contracts have now been unlocked.\nTo see available contracts close this message and then {0} anywhere on the screen to bring up the action menu.".localize("{0} click/touch verb").format(Tutorial.getClickVerb()));
    Tutorial.contractsUnlocked = function (a) {
        c(d.contractsUnlocked, a)
    };
    d.contracts = new k("contracts", "Contracts".localize(), "Contracts are a useful tool to earn some extra cash when your balance is low and can also be useful to generate a small number of research points.\nContracts require you to generate a certain amount of design and technology points before the time runs out.{n}Decide carefully what contract you accept. If you miss the deadline for a contract you will have to pay a penalty so it's better to start out with smaller contracts and see how much you can handle.".localize());
    Tutorial.contracts = function () {
        c(d.contracts)
    };
    d.gameReleased = new k("gameReleased", "Game released".localize("heading"), "Your game is now complete and will be handed off to publishing.\nWe should see reviews and sales coming in for the game soon!".localize());
    Tutorial.gameReleased = function () {
        c(d.gameReleased)
    };
    d.gameDevCompleted = new k("gameDevCompleted", "Game development completed".localize("heading"), "The development of your game has now finished. While developing games you gain experience and improve your skills.\nWhen development is completed you will be presented with a summary of the experience gained.".localize());
    Tutorial.gameDevCompleted = function (a) {
        c(d.gameDevCompleted, a)
    };
    d.firstSales = new k("firstSales", "First sales".localize("heading"), "Now that your game is on sale you will receive the income from the game every week.\nYou can see how well your game is doing by looking at the sales graph in the top right of the screen.".localize());
    Tutorial.firstSales = function () {
        c(d.firstSales, 0.1)
    };
    d.researchMenu = new k("researchMenu", "Research".localize("heading"), "Research is important to unlock new options and make better games.\nYou should try to save enough research points to be able to create your own game engine.\nThis will greatly improve your games.{n}Hint: Try to develop games with different topic and genre combinations for a slight research boost.".localize());
    Tutorial.researchMenu = function () {
        c(d.researchMenu)
    };
    d.devPhases = new k("devPhases", "Development phases".localize("heading"), "Game development runs through three stages. At the beginning of each stage you can decide what areas of the game you want to focus on.\nPicking the right focus for your game greatly increases the points you generate.{n}Think about what areas are important for your game and decrease the focus on areas you think are less important. If you want to read a brief description of the different areas please refer to the Help menu.".localize());
    Tutorial.devPhases = function (a) {
        c(d.devPhases, a)
    };
    d.researchedCustomEngine = new k("researchedCustomEngine", "Research custom engine".localize("heading"), "Now you can create your own game engines.\nTo get started close this message and {0} anywhere to bring up the action menu.".localize("{0} click/touch verb").format(Tutorial.getClickVerb()));
    Tutorial.researchedCustomEngine = function () {
        c(d.researchedCustomEngine)
    };
    d.researchedEnginePart = new k("researchedEnginePart", "Research engine part".localize("heading"),
        "You have just researched your first engine part.\nTo be able to use this in your games you need to create a new engine which includes this part.".localize());
    Tutorial.researchedEnginePart = function () {
        c(d.researchedEnginePart)
    };
    d.creatingEngine = new k("creatingEngine", "Creating engine".localize("heading"), "You are now creating your own custom game engine.\n\nOnce the engine is finished you will be able to use it when creating new games.".localize());
    Tutorial.creatingEngine = function () {
        c(d.creatingEngine,
            0.5)
    };
    d.targetAudience = new k("targetAudience", "Target audience".localize("heading"), "You can now specify what your main target audience is for your game. Games can be targeted at young people, at everyone or at more mature audiences.{n}Picking the right target audience for your game is important. Your target platform can also play a role. Some platforms are especially popular with a specific audience.".localize());
    Tutorial.targetAudience = function () {
        c(d.targetAudience)
    };
    d.marketingUnlocked = new k("marketingUnlocked",
        "Marketing Unlocked".localize("heading"), "You've successfully unlocked marketing. You can access marketing options in the action menu but only while a game is in development.".localize());
    Tutorial.marketingUnlocked = function () {
        c(d.marketingUnlocked)
    };
    d.marketing = new k("marketing", "Marketing".localize(), "Marketing can be very effective to reach more potential customers but it can be very expensive too. It is best to experiment carefully with marketing to get a feel for what works best. Don't invest too much and remember that timing is important. Don't invest in your marketing efforts too early in development or too late.{n}It is also important to know that no matter how much money you pump into marketing, it will not make a bad game successful. To the contrary, it can even hurt to market bad games too much as it can upset your existing fans.".localize());
    Tutorial.marketing = function (a) {
        c(d.marketing, a)
    };
    d.hypePoints = new k("hypePoints", "Hype points".localize("heading"), "Developing a great game is not the only recipe for success. It is essential to build hype to ensure that players are excited about your game.{n}In the beginning of your career, hype is mostly generated through random events but once you gain more experience you can use marketing and other strategies to generate hype.".localize());
    Tutorial.hypePoints = function () {
        c(d.hypePoints)
    };
    d.level2 =
        new k("level2", "Level 2".localize("heading"), "You now may also train yourself and your staff to improve skills.\nLet's try this by completing a management course which is required before you can hire your first employee.{n}To get started close this message and then {0} on your character to bring up the training menu.".localize("{0} click/touch verb").format(Tutorial.getClickVerb()));
    Tutorial.level2 = function () {
        c(d.level2, 0.3)
    };
    d.firstEngine = new k("firstEngine", "First engine".localize("heading"), "Congratulations! Your first custom game engine is now ready.\nYou should try using it in your next game.".localize());
    Tutorial.firstEngine = function () {
        c(d.firstEngine)
    };
    d.findStaff = new k("findStaff", "Finding staff".localize("heading"), "Before you can hire someone you have to advertise the open position, set an advertising budget and decide how you want to test your applicants.{n}A high budget will increase the number of applicants and the different tests will help find people with the right balance of design and technology skills.".localize());
    Tutorial.findStaff = function () {
        c(d.findStaff)
    };
    d.needsAHoliday = new k("needsAHoliday",
        "Staff vacation".localize("heading"), "From time to time your employees need to recharge their batteries and go on vacation. You can tell that an employee is in need of rest when their efficiency steadily decreases.{n}To give them a holiday just {0} on them and select Send on Vacation".localize("{0} click/touch verb").format(Tutorial.getClickVerb()));
    Tutorial.needsAHoliday = function () {
        c(d.needsAHoliday, 0.3)
    };
    d.hireStaff = new k("hireStaff", "Hiring staff".localize("heading"), "The search for the open position is complete!\nYou can now review the list of applicants and hire someone for this position.{n}Don't forget that you can always train your employees to improve their skills.".localize());
    Tutorial.hiringStaff = function (b) {
        a("hireStaff") && (c(d.hireStaff, b), Media.createLevel2OfficeStory())
    };
    d.staffHired = new k("staffHired", "Staff hired".localize("heading"), "Congratulations on your first hire!\nNew employees have to settle in before they become fully effective.\nWhen a character is not fully efficient you can see an efficiency bar next to them. This bar will fill up slowly over time.{n}It is usually a good idea to give your new staff a Welcome training to get them up to speed quickly.\nThis will maximize their efficiency way faster than normally.\nTo do this close this message and then {0} on the character to bring up the action menu.".localize("{0} click/touch verb").format(Tutorial.getClickVerb()));
    Tutorial.staffHired = function () {
        a("staffHired") && c(d.staffHired)
    };
    d.hireMoreStaff = new k("hireMoreStaff", "Hiring more staff".localize("heading"), "You can hire up to four employees in this office. Don't try to hire everyone at once as staff are expensive.\nMany rookies hire too early and go bankrupt.\nIt is best to take it slow.".localize());
    Tutorial.hireMoreStaff = function () {
        c(d.hireMoreStaff)
    };
    d.boosts = new k("boosts", "Boosts".localize("heading"), "Boosts are a powerful tool that allow you to temporarily increase the output of your staff.\nThey are most effective when timed strategically during the development of a game or during training.{n}Boosts need to recharge before you can use them. You can activate a boost as soon as the recharge progress is complete but you can also wait a little longer to further increase the effectiveness of the boost.".localize());
    Tutorial.boosts = function () {
        c(d.boosts, 0.3, "./images/misc/boost.png")
    };
    d.additionalFeatures = new k("additionalFeatures", "Additional game features".localize("heading"), "During development you can also select additional features for your game. Right now you can only pick 'Basic Sounds' but your options will increase quickly. Selecting additional features makes the game generally better but also increases its cost.{n}You will also see the graphic type you selected when you defined the game. This is just to remind you of your choice. You cannot change the type of graphics mid-game.".localize());
    Tutorial.additionalFeatures = function (a) {
        c(d.additionalFeatures, a)
    };
    d.finishingPhase = new k("finishingPhase", "Finishing phase".localize("heading"), "The development of your first game is now complete. You can press the 'Finish' button to publish your game but you should only do that once you fix the majority of bugs.{n}Releasing a game without fixing bugs can severely affect your ratings so you should only ever consider that if you need the cash and you can't afford to wait.".localize());
    Tutorial.finishingPhase =
        function (a) {
            c(d.finishingPhase, a)
        };
    d.training = new k("training", "Training".localize("heading"), "If you want to create hit-games and have a world class team then training is important.\n For best results train your staff regularly but don't overwhelm them with too many sessions at once.{n}There are different training options available.\nSome options are better to increase certain skills than others. Experimenting is the best way to figure out which training options fit your plans.\nIt is useful to have a mix of 'specialists' and allrounders in your team but aim to have at least one design specialist and technology specialist.".localize());
    Tutorial.training = function () {
        c(d.training)
    };
    d.staffReachedLvl5 = new k("staffReachedLvl5", "Level 5 unlocks".localize("heading"), "Someone on your team has reached experience level 5! This unlocks a special training item called Boost. The training for it is expensive and you can only do it once the character has at least 500 design or technology points but the investment is well worth it.{n}Once trained, the boost allows you to temporarily increase the output of your staff and can really help you to make a hit-game.".localize());
    Tutorial.staffReachedLvl5 = function () {
        c(d.staffReachedLvl5)
    };
    d.publishers = new k("publishers", "Publishers".localize("heading"), "Using a publisher is a great way to get your games in front of a large audience which in turns helps to grow your fan base.\nOnce your fan base is big enough you can self-publish your larger games without the need for a publisher.\nFor medium games you should aim to have at least 100K fans before you publish them yourself.{n}To use a publisher you need to sign a contract. The contract will dictate what game you need to create. Pay attention to all the details, most importantly the minimum score that the contract dictates. If the game you release does not meet the minimum score you will have to pay a penalty, which can be costly.{n}It is also important to pay attention to the royalty rate. The higher the rate the more money you will make from the contract.".localize());
    Tutorial.publishers = function () {
        c(d.publishers)
    };
    d.staffResponsibility = new k("staffResponsibility", "Staff responsibilities".localize("heading"), "Creating larger games is a significant task and, unlike in small games, one person cannot effectively be responsible for every aspect of a game.\nTo create a good game and to make best use of your team you will have to assign which of your team is responsible for which areas.{n}Pick team members whose skills match the area to get the best result.\nWhen you assign a team member responsibilities you will see their workload. Try not to overload them too much.".localize());
    Tutorial.staffResponsibility = function (a) {
        c(d.staffResponsibility, a)
    };
    d.designSpecialist = new k("designSpecialist", "Design specialist".localize("heading"), "You need a design specialist to open a research and development lab. You can train someone to become a specialist via the training menu but the option is only available once they have a certain design skill level.{n}You can also train technology specialists which come in handy for later options.".localize());
    Tutorial.designSpecialist = function (a) {
        c(d.designSpecialist,
            a)
    };
    d.rndLabReady = new k("rndLabReady", "R&D lab is ready".localize("heading"), "To visit the lab simply {0} the screen and drag to the left or use the arrow keys on the keyboard. Alternatively, you can also click on the little R&D Lab information card in the bottom right of the screen.".localize("{0} click/touch verb").format(Tutorial.getClickVerb()));
    Tutorial.rndLabReady = function () {
        c(d.rndLabReady)
    };
    d.rndLab = new k("rndLab", "R&D lab".localize(), "To start a project simply {0} the screen to bring up the research menu.\nOnce you start a project you can also cancel it using the same menu.".localize("{0} click/touch verb").format(Tutorial.getClickVerb()));
    Tutorial.rndLab = function (a) {
        c(d.rndLab, a)
    };
    d.hwLabReady = new k("hwLabReady", "Hardware lab is ready".localize("heading"), "To visit the hardware lab simply {0} the screen and drag to the right or use the arrow keys on the keyboard. Alternatively, you can also click on the little Hardware Lab information card in the top left of the screen.".localize("{0} click/touch verb").format(Tutorial.getClickVerb()));
    Tutorial.hwLabReady = function () {
        c(d.hwLabReady)
    };
    d.rndProjectStarted = new k("rndProjectStarted", "R&D project started".localize("heading"),
        "The project is now started and as your researchers work on it you will see the progress in the status card. Don't forget to adjust the budget! If the budget is 0 the project will never progress.".localize());
    Tutorial.rndProjectStarted = function () {
        c(d.rndProjectStarted)
    };
    d.consoleDev = new k("consoleDev", "Console Development".localize(), "Developing your own console is a very costly undertaking. Not only do you have to pay a big chunk of money up front for the project but you will also have to pay your hardware lab crew. Only attempt to create a console if you are confident that you have enough capital.{n}When developing a console you can decide on how your console will look like and decide on the technical features as well as the quality assurance budget. The more sophisticated your technology is the better the console will fare against competing products. The more budget you reserve for QA the better the quality of your console will be.".localize());
    Tutorial.devConsole = function () {
        c(d.consoleDev)
    };
    d.consoleReleased = new k("consoleReleased", "Console released".localize("heading"), "Your very own game console is now on the market. Game consoles are complex machines and when you sell a lot of them it is only natural that some of them need to be repaired.{n}While your console is on sale your hardware team will have to work off maintenance points. Depending on the quality of the console and how many you sell these points vary from week to week.{n}Try to give your hardware lab enough budget so that they stay on top of the maintenance, otherwise customers will become unhappy when they have to wait too long for their consoles to be repaired. You can see how well your team is doing in the console information card in the top left of the screen.".localize());
    Tutorial.consoleReleased = function (a) {
        c(d.consoleReleased, a)
    };
    d.mmoOnSale = new k("mmoOnSale", "MMO on sale".localize("heading"), "Your MMO is on sale now. MMOs work slightly different than normal games. MMOs not only generate income but also cause maintenance costs as we need to run game servers and provide customer services. You will see the amount of maintenance paid in the sales card.{n}Unlike other games which have a limited sales duration MMOs sell indefinitely. You will have to decide yourself when you want to take an MMO off the market. To take an MMO off the market simply {0} on the sales card to bring up a menu.{n}Since MMOs are so expensive to create you might want to try to expand your current MMO rather than create a new one. To do this you will need to create a expansion pack, which you can start to research now.".localize().format(Tutorial.getClickVerb()));
    Tutorial.mmoOnSale = function (a) {
        c(d.mmoOnSale, a)
    };
    d.additionalSpecialists = new k("additionalSpecialists", "Additional Specialists".localize("heading"), "While you only need one specialist to start running a lab you can train more than one. Additional specialists decrease the overall running cost of your lab.".localize());
    Tutorial.additionalSpecialists = function (a) {
        c(d.additionalSpecialists, a)
    };
    d.missionHints = new k("missionHints", "Hints".localize("heading"), "While generating game reports you start to gain insights into the development process and learn about what works well and what doesn't work so well.\nThese insights are shown as hints on the development screen (unless you have turned this option off in the settings).{n}The hints range from '+++' to '--' and indicate how important an area is for this type of game. When hints have a question mark at the end (e.g. '+++?') it means that you have insights from a game in the same genre but that you are not yet sure whether this holds true for this particular genre/topic combination.".localize());
    Tutorial.missionHints = function (a) {
        c(d.missionHints, a)
    };
    d.gameReportComplete = new k("gameReportComplete", "Game Reports".localize("heading"), "Game reports are a great way to gain more research points and new insights. It pays off to generate a report for each game you release.\nNow that you've completed your first game report it's a good idea to look at the research menu.\nTo open the research menu close this message and then {0} anywhere on the screen to bring up the action menu.".localize("{0} click/touch verb").format(Tutorial.getClickVerb()));
    Tutorial.gameReportComplete = function (a) {
        c(d.gameReportComplete, a)
    };
    d.pirateMode = new k("pirateMode", "Pirate Mode".localize(), "Your game sales are severely reduced in pirate mode and survival is unlikely. Once you are able to create your own engines you can counteract the effects of piracy by researching copy protection and integrating it in your games.{n}While copy protection decreases the effect of piracy on sales, it will also upset some of your fans. Making matters worse, copy protection is fast moving technology and if you don't stay up to date with new innovations, it will become less effective over time.{n}You can see the effects of piracy and the state of your copy protection through your game reports.".localize());
    Tutorial.pirateShareOffers = function (a) {
        c(d.pirateShareOffers, a)
    };
    d.pirateShareOffers = new k("pirateShareOffers", "Share Offers".localize("heading"), "To stay afloat in pirate mode you can sell part of your company to a third party to receive a much needed cash boost. Be mindful, however, that shareholders will automatically receive small dividend payments any time you make a profit from game sales.{n}These dividends grow larger the more shares you have sold and while they may seem insignificant, they can add up to a lot of lost profit over time.{n}You will be given the option to buy back shares regularly but share holders only offer buy-back options for a hefty profit.".localize())
})();
var Research = {};
(function () {
    var a = Research;
    a.FACTOR_FOR_NEW_COMBINATIONS = 2;
    a.TOPICS_VISIBLE = 4;
    var b = "General",
        c = "General".localize(),
        f = "general";
    a.ResearchTopicItem = {
        id: "New Topic",
        name: "New Topic".localize(),
        pointsCost: 10,
        duration: 1E4,
        category: b,
        categoryDisplayName: c
    };
    a.CustomEngine = {
        id: "Custom Engine",
        name: "Custom Game Engine".localize(),
        pointsCost: 50,
        duration: 15E3,
        category: b,
        categoryDisplayName: c
    };
    a.BasicItems = [a.ResearchTopicItem, a.CustomEngine];
    a.checkForNewResearch = function () {
        for (var b = [], c = GameManager.company,
            d = this.getAllItems().except(Research.StartEngineParts.concat(c.researchCompleted.concat(c.availableResearch).concat(General.getAvailableEngineParts(c)))), f = 0; f < d.length; f++) {
            var n = d[f];
            void 0 != n.canResearch && n.canResearch(c) && (n.v && c.canDevelopEngine() || !n.v) && -1 == b.indexOf(n) && b.push(n)
        }
        if (0 < b.length) {
            d = "New research available:".localize();
            for (f = 0; f < b.length; f++) n = b[f], c.availableResearch.push(n), d += "\n" + n.name;
            b = new Notification("New Research!".localize("heading"), d);
            b.sound = "research";
            b.type = NotificationType.NewResearchAvailable;
            c.notifications.push(b)
        }
        a._checkForNewLabResearch && a._checkForNewLabResearch(c)
    };
    b = "Graphic";
    c = "Graphic".localize();
    f = "graphic-type";
    a.textGraphics = {
        id: "Text Based",
        name: "Text based".localize(),
        devCost: 2E3,
        v: 1,
        techLevel: 0,
        category: b,
        categoryDisplayName: c,
        group: f
    };
    var d = "2D Graphics V{0}".localize();
    a.TwoDGraphicsV1 = {
        id: "2D Graphics V1",
        name: d.format(1),
        engineCost: 1E4,
        devCost: 15E3,
        v: 2,
        canResearch: function (a) {
            return !1
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        consolePart: !0,
        techLevel: 1
    };
    a.TwoDGraphicsV2 = {
        id: "2D Graphics V2",
        name: d.format(2),
        v: 4,
        canResearch: function (a) {
            return !1
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        consolePart: !0,
        techLevel: 2,
        showXPGain: !0
    };
    a.TwoDGraphicsV3 = {
        id: "2D Graphics V3",
        name: d.format(3),
        v: 6,
        canResearch: function (a) {
            return 2 < LevelCalculator.getFeatureLevel(a, "2D Graphics V2")
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        consolePart: !0,
        techLevel: 2,
        showXPGain: !0
    };
    a.TwoDGraphicsV4 = {
        id: "2D Graphics V4",
        name: d.format(4),
        v: 8,
        canResearch: function (a) {
            return 2 < LevelCalculator.getFeatureLevel(a,
                "2D Graphics V3")
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        consolePart: !0,
        techLevel: 3,
        showXPGain: !0
    };
    a.TwoDGraphicsV5 = {
        id: "2D Graphics V5",
        name: d.format(5),
        v: 10,
        canResearch: function (a) {
            return 2 < LevelCalculator.getFeatureLevel(a, "2D Graphics V4")
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        consolePart: !0,
        techLevel: 3,
        showXPGain: !0
    };
    d = "3D Graphics V{0}".localize();
    a.ThreeDGraphicsV1 = {
        id: "3D Graphics V1",
        name: d.format(1),
        v: 2,
        canResearch: function (a) {
            return 2 < LevelCalculator.getFeatureLevel(a, "2D Graphics V2")
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        consolePart: !0,
        techLevel: 1,
        showXPGain: !0
    };
    a.ThreeDGraphicsV2 = {
        id: "3D Graphics V2",
        name: d.format(2),
        v: 4,
        canResearch: function (a) {
            return 2 < LevelCalculator.getFeatureLevel(a, "3D Graphics V1")
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        consolePart: !0,
        techLevel: 2,
        showXPGain: !0
    };
    a.ThreeDGraphicsV3 = {
        id: "3D Graphics V3",
        name: d.format(3),
        v: 6,
        canResearch: function (a) {
            return 2 < LevelCalculator.getFeatureLevel(a, "3D Graphics V2")
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        consolePart: !0,
        techLevel: 3,
        showXPGain: !0
    };
    a.ThreeDGraphicsV4 = {
        id: "3D Graphics V4",
        name: d.format(4),
        v: 8,
        canResearch: function (a) {
            return 2 < LevelCalculator.getFeatureLevel(a, "3D Graphics V3")
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        consolePart: !0,
        techLevel: 4,
        showXPGain: !0
    };
    a.ThreeDGraphicsV5 = {
        id: "3D Graphics V5",
        name: d.format(5),
        v: 10,
        canResearch: function (a) {
            return 2 < LevelCalculator.getFeatureLevel(a, "3D Graphics V4")
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        consolePart: !0,
        techLevel: 5,
        showXPGain: !0
    };
    a.ThreeDGraphicsV6 = {
        id: "3D Graphics V6",
        name: d.format(6),
        v: 12,
        canResearch: function (a) {
            return !1
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        consolePart: !0,
        techLevel: 6,
        showXPGain: !0
    };
    a.ThreeDGraphicsV7 = {
        id: "3D Graphics V7",
        name: d.format(7),
        v: 14,
        canResearch: function (a) {
            return !1
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        consolePart: !0,
        techLevel: 7,
        showXPGain: !0
    };
    a.stereoScopic3D = {
        id: "Stereoscopic 3D",
        name: "Advanced Stereoscopic 3D".localize(),
        v: 4,
        canResearch: function (a) {
            return 6 < LevelCalculator.getMissionLevel("Graphic")
        },
        canUse: function (a) {
            if (!a || !a.features) return !1;
            var b = "3D Graphics V3;3D Graphics V4;3D Graphics V4;3D Graphics V5;3D Graphics V6;3D Graphics V7".split(";");
            return a.features.some(function (a) {
                return -1 != b.indexOf(a.id)
            })
        },
        category: b,
        categoryDisplayName: c,
        consolePart: !0
    };
    a.graphicItems = [a.textGraphics, a.TwoDGraphicsV1, a.TwoDGraphicsV2, a.TwoDGraphicsV3, a.TwoDGraphicsV4, a.TwoDGraphicsV5, a.ThreeDGraphicsV1, a.ThreeDGraphicsV2, a.ThreeDGraphicsV3, a.ThreeDGraphicsV4, a.ThreeDGraphicsV5, a.ThreeDGraphicsV6, a.ThreeDGraphicsV7,
    a.stereoScopic3D
    ];
    b = "Sound";
    c = "Sound".localize();
    f = "Sound";
    a.simpleSounds = {
        id: "Basic Sound",
        name: "Basic sounds".localize(),
        devCost: 1E3,
        v: 1,
        category: b,
        categoryDisplayName: c,
        group: f
    };
    a.mono = {
        id: "Mono sound",
        name: "Mono sound".localize(),
        v: 2,
        canResearch: function (a) {
            return a.canDevelopEngine() && 1 < LevelCalculator.getMissionLevel("Sound")
        },
        category: b,
        categoryDisplayName: c,
        group: f
    };
    a.stereo = {
        id: "Stereo sound",
        name: "Stereo sound".localize(),
        v: 4,
        canResearch: function (a) {
            return 3 < LevelCalculator.getMissionLevel("Sound")
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        consolePart: !0
    };
    a.soundTrack = {
        id: "Soundtrack",
        name: "Soundtrack".localize(),
        v: 4,
        canResearch: function (a) {
            return 4 < LevelCalculator.getMissionLevel("Sound")
        },
        category: b,
        categoryDisplayName: c,
        group: "soundtrack",
        consolePart: !0
    };
    a.surround = {
        id: "Surround sound",
        name: "Surround sound".localize(),
        v: 6,
        canResearch: function (a) {
            return 5 < LevelCalculator.getMissionLevel("Sound")
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        consolePart: !0
    };
    a.orchestralSoundtrack = {
        id: "Orchestral Soundtrack",
        name: "Orchestral soundtrack".localize(),
        v: 8,
        canResearch: function (a) {
            return 6 < LevelCalculator.getMissionLevel("Sound")
        },
        category: b,
        categoryDisplayName: c,
        group: "soundtrack"
    };
    a.soundItems = [a.simpleSounds, a.mono, a.stereo, a.soundTrack, a.surround, a.orchestralSoundtrack];
    b = "AI";
    c = "A.I.".localize();
    a.simpleAI = {
        id: "simpleAI",
        name: "Simple A.I.".localize(),
        v: 2,
        canResearch: function (a) {
            return a.canDevelopEngine() && 1 < LevelCalculator.getMissionLevel("AI")
        },
        category: b,
        categoryDisplayName: c,
        group: "ai"
    };
    a.AI = {
        id: "AI",
        name: "Better A.I.".localize(),
        v: 4,
        canResearch: function (a) {
            return a.canDevelopEngine() && 3 < LevelCalculator.getMissionLevel("AI")
        },
        category: b,
        categoryDisplayName: c,
        group: "ai"
    };
    a.AICompanions = {
        id: "AI Companions",
        name: "A.I. Companions".localize(),
        v: 4,
        canResearch: function (a) {
            return 4 < LevelCalculator.getMissionLevel("AI")
        },
        category: b,
        categoryDisplayName: c
    };
    a.SelfLearningAI = {
        id: "Self learning AI",
        name: "Self-learning A.I.".localize(),
        v: 10,
        canResearch: function (a) {
            return 8 < LevelCalculator.getMissionLevel("AI")
        },
        category: b,
        categoryDisplayName: c
    };
    a.aiItems = [a.AI, a.AICompanions, a.SelfLearningAI];
    b = "Gameplay";
    c = "Gameplay".localize();
    a.GameTutorials = {
        id: "Game Tutorials",
        name: "Game tutorials".localize(),
        v: 2,
        canResearch: function (a) {
            return a.canDevelopEngine() && 1 < LevelCalculator.getMissionLevel("Gameplay")
        },
        category: b,
        categoryDisplayName: c
    };
    a.BetterUI = {
        id: "BetterUI",
        name: "Better user experience".localize(),
        v: 2,
        canResearch: function (a) {
            return a.canDevelopEngine() && 2 < LevelCalculator.getMissionLevel("Gameplay")
        },
        category: b,
        categoryDisplayName: c
    };
    a.characterProgression = {
        id: "Character progression",
        name: "Character progression".localize(),
        v: 4,
        canResearch: function (a) {
            return a.canDevelopEngine() && 3 < LevelCalculator.getMissionLevel("Gameplay")
        },
        category: b,
        categoryDisplayName: c
    };
    a.Achievements = {
        id: "Achievements",
        name: "Achievements".localize(),
        v: 2,
        canResearch: function (a) {
            return 5 < LevelCalculator.getMissionLevel("Gameplay") && a.isLaterOrEqualThan(13)
        },
        category: b,
        categoryDisplayName: c,
        consolePart: !0
    };
    a.SkillTrees = {
        id: "Skill trees",
        name: "Skill trees".localize(),
        v: 6,
        canResearch: function (a) {
            return 6 < LevelCalculator.getMissionLevel("Gameplay")
        },
        category: b,
        categoryDisplayName: c
    };
    a.CoOp = {
        id: "CoOp",
        name: "Cooperative play".localize(),
        v: 8,
        canResearch: function (a) {
            return 7 < LevelCalculator.getMissionLevel("Gameplay")
        },
        category: b,
        categoryDisplayName: c
    };
    a.vrHeadset = {
        id: "vrHeadset",
        name: "Visorius Support".localize(),
        v: 8,
        canResearch: function (a) {
            return a.flags.visoriusAnnounced
        },
        category: b,
        categoryDisplayName: c,
        consolePart: !0
    };
    a.gameplayItems = [a.GameTutorials, a.BetterUI, a.Achievements, a.characterProgression, a.SkillTrees, a.CoOp, a.vrHeadset];
    b = "Engine";
    c = "Engine".localize();
    a.saveGame = {
        id: "Savegame",
        name: "Savegame".localize(),
        v: 1,
        canResearch: function (a) {
            return !1
        },
        category: b,
        categoryDisplayName: c,
        group: "savegame"
    };
    a.Multiplayer = {
        id: "Multiplayer",
        name: "Multiplayer".localize(),
        v: 2,
        canResearch: function (a) {
            return a.canDevelopEngine() && 3 < LevelCalculator.getMissionLevel("Engine")
        },
        category: b,
        categoryDisplayName: c,
        group: "multiplayer",
        consolePart: !0
    };
    a.VideoPlayback = {
        id: "Video playback",
        name: "Video playback".localize(),
        v: 4,
        canResearch: function (a) {
            return a.canDevelopEngine() && 4 < LevelCalculator.getMissionLevel("Engine")
        },
        category: b,
        categoryDisplayName: c,
        consolePart: !0
    };
    a.BasicPhysics = {
        id: "Basic physics",
        name: "Basic physics".localize(),
        v: 4,
        canResearch: function (a) {
            return a.canDevelopEngine() && 5 < LevelCalculator.getMissionLevel("Engine")
        },
        category: b,
        categoryDisplayName: c,
        consolePart: !0
    };
    a.ModSupport = {
        id: "Mod support",
        name: "Mod support".localize(),
        v: 2,
        canResearch: function (a) {
            return a.canDevelopEngine() && 5 < LevelCalculator.getMissionLevel("Engine")
        },
        category: b,
        categoryDisplayName: c
    };
    a.OnlinePlay = {
        id: "Online play",
        name: "Online play".localize(),
        v: 6,
        canResearch: function (a) {
            return a.canDevelopEngine() && 6 < LevelCalculator.getMissionLevel("Engine")
        },
        category: b,
        categoryDisplayName: c,
        group: "multiplayer",
        consolePart: !0
    };
    a.AdvancedPhysics = {
        id: "Advanced Physics",
        name: "Advanced physics".localize(),
        v: 8,
        canResearch: function (a) {
            return a.canDevelopEngine() && 8 < LevelCalculator.getMissionLevel("Engine")
        },
        category: b,
        categoryDisplayName: c,
        consolePart: !0
    };
    a.saveToCloud = {
        id: "Save to cloud",
        name: "Save to cloud".localize(),
        v: 2,
        canResearch: function (a) {
            return 5 < LevelCalculator.getMissionLevel("Engine") && a.isLaterOrEqualThan(13)
        },
        category: b,
        categoryDisplayName: c,
        consolePart: !0
    };
    a.MMOSupport = {
        id: "mmoSupport",
        name: "MMO Support".localize(),
        v: 10,
        canResearch: function (a) {
            return a.canDevelopMMOGames()
        },
        category: b,
        categoryDisplayName: c,
        group: "multiplayer",
        consolePart: !1,
        canUse: function (a) {
            return !1
        }
    };
    a.sdk = {
        id: "SDK",
        name: "Software Development Kit".localize(),
        pointsCost: 100,
        duration: 1E4,
        enginePoints: 40,
        engineCost: 1E5,
        canResearch: function (b) {
            return -1 != b.researchCompleted.indexOf(a.sublicenseEngines)
        },
        category: b,
        categoryDisplayName: c,
        canUse: function (a) {
            return !1
        }
    };
    a.MultiPlatformOptimized = {
        id: "MultiPlatformOptimized",
        name: "Multi-Platform optimized".localize(),
        pointsCost: 100,
        duration: 1E4,
        enginePoints: 50,
        engineCost: 2E6,
        canResearch: function (a) {
            return a.flags.multiPlatformOptimizeResearchAvailable
        },
        category: b,
        categoryDisplayName: c,
        canUse: function (a) {
            return !1
        }
    };
    a.engineItems = [a.saveGame, a.Multiplayer, a.VideoPlayback, a.BasicPhysics, a.OnlinePlay, a.AdvancedPhysics, a.MMOSupport, a.saveToCloud, a.ModSupport, a.sdk, a.MultiPlatformOptimized];
    b = "Story/Quests";
    c = "Story/Quests".localize();
    a.linearStory = {
        id: "Linear story",
        name: "Linear story".localize(),
        v: 2,
        canResearch: function (a) {
            return !1
        },
        category: b,
        categoryDisplayName: c,
        group: "story"
    };
    a.simpleCutScenes = {
        id: "Simple cutscenes",
        name: "Simple cutscenes".localize(),
        v: 2,
        canResearch: function (a) {
            return 2 <
                LevelCalculator.getMissionLevel("Story/Quests")
        },
        category: b,
        categoryDisplayName: c,
        group: "cutscenes"
    };
    a.branchedStory = {
        id: "Branching story",
        name: "Branching story".localize(),
        v: 4,
        canResearch: function (a) {
            return 3 < LevelCalculator.getMissionLevel("Story/Quests")
        },
        category: b,
        categoryDisplayName: c,
        group: "story"
    };
    a.advancedCutScenes = {
        id: "Advanced cutscenes",
        name: "Advanced cutscenes".localize(),
        v: 4,
        canResearch: function (a) {
            return 4 < LevelCalculator.getMissionLevel("Story/Quests")
        },
        category: b,
        categoryDisplayName: c,
        group: "cutscenes"
    };
    a.fullMotionVideo = {
        id: "fmv",
        name: "Full motion video".localize(),
        v: 6,
        canResearch: function (a) {
            return 5 < LevelCalculator.getMissionLevel("Story/Quests")
        },
        category: b,
        categoryDisplayName: c
    };
    a.interactiveStory = {
        id: "Interactive story",
        name: "Interactive story".localize(),
        v: 6,
        canResearch: function (a) {
            return 6 < LevelCalculator.getMissionLevel("Story/Quests")
        },
        category: b,
        categoryDisplayName: c,
        group: "story"
    };
    a.moralChoices = {
        id: "Moral choices",
        name: "Moral choices".localize(),
        v: 6,
        canResearch: function (a) {
            return 6 <
                LevelCalculator.getMissionLevel("Story/Quests")
        },
        category: b,
        categoryDisplayName: c
    };
    a.immersiveStoryTelling = {
        id: "Immersive story telling",
        name: "Immersive story telling".localize(),
        v: 8,
        canResearch: function (a) {
            return 7 < LevelCalculator.getMissionLevel("Story/Quests")
        },
        category: b,
        categoryDisplayName: c,
        group: "story"
    };
    a.reactiveQuests = {
        id: "Reactive quests",
        name: "Reactive quests".localize(),
        v: 10,
        canResearch: function (a) {
            return 8 < LevelCalculator.getMissionLevel("Story/Quests")
        },
        category: b,
        categoryDisplayName: c
    };
    a.storyItems = [a.linearStory, a.branchedStory, a.simpleCutScenes, a.advancedCutScenes, a.fullMotionVideo, a.interactiveStory, a.moralChoices, a.immersiveStoryTelling, a.reactiveQuests];
    b = "Dialogs";
    c = "Dialogues".localize();
    a.betterDialogs = {
        id: "Better dialogues",
        name: "Better dialogues".localize(),
        v: 1,
        canResearch: function (a) {
            return 2 < LevelCalculator.getMissionLevel("Dialogs")
        },
        category: b,
        categoryDisplayName: c
    };
    a.dialogueTree = {
        id: "Dialogue tree",
        name: "Dialogue tree".localize(),
        v: 4,
        canResearch: function (a) {
            return 3 <
                LevelCalculator.getMissionLevel("Dialogs")
        },
        category: b,
        categoryDisplayName: c
    };
    a.voiceOver = {
        id: "Voice over",
        name: "Voice over".localize(),
        v: 6,
        canResearch: function (a) {
            return 5 < LevelCalculator.getMissionLevel("Dialogs")
        },
        category: b,
        categoryDisplayName: c,
        group: "Voice acting"
    };
    a.simpleBodyLanguage = {
        id: "Simple body language",
        name: "Simple body language".localize(),
        v: 6,
        canResearch: function (a) {
            return 5 < LevelCalculator.getMissionLevel("Dialogs")
        },
        category: b,
        categoryDisplayName: c,
        group: "Body language"
    };
    a.advancedBodyLanguage = {
        id: "Advanced body language",
        name: "Advanced body language".localize(),
        v: 8,
        canResearch: function (a) {
            return 6 < LevelCalculator.getMissionLevel("Dialogs")
        },
        category: b,
        categoryDisplayName: c,
        group: "Body language"
    };
    a.celebrityVoiceActing = {
        id: "Celebrity voice acting",
        name: "Celebrity voice acting".localize(),
        v: 6,
        canResearch: function (a) {
            return 7 < LevelCalculator.getMissionLevel("Dialogs")
        },
        category: b,
        categoryDisplayName: c,
        group: "Voice acting"
    };
    a.realisticBodyLanguage = {
        id: "Realistic body language",
        name: "Realistic body language".localize(),
        v: 10,
        canResearch: function (a) {
            return 8 < LevelCalculator.getMissionLevel("Dialogs")
        },
        category: b,
        categoryDisplayName: c,
        group: "Body language"
    };
    a.dialogItems = [a.betterDialogs, a.dialogueTree, a.voiceOver, a.simpleBodyLanguage, a.advancedBodyLanguage, a.celebrityVoiceActing, a.realisticBodyLanguage];
    b = "World Design";
    c = "World Design".localize();
    a.openWorld = {
        id: "Open world",
        name: "Open world".localize(),
        v: 2,
        canResearch: function (a) {
            return 2 < LevelCalculator.getMissionLevel("World Design")
        },
        category: b,
        categoryDisplayName: c
    };
    a.dayNightCycle = {
        id: "Day/Night Cycle",
        name: "Day & night cycle".localize(),
        v: 2,
        canResearch: function (a) {
            return 3 < LevelCalculator.getMissionLevel("World Design")
        },
        category: b,
        categoryDisplayName: c
    };
    a.richBackStory = {
        id: "Rich Backstory",
        name: "Rich backstory".localize(),
        v: 2,
        enginePoints: 0,
        canResearch: function (a) {
            return 4 < LevelCalculator.getMissionLevel("World Design")
        },
        category: b,
        categoryDisplayName: c
    };
    a.virtualEconomy = {
        id: "Virtual economy",
        name: "Virtual economy".localize(),
        v: 4,
        canResearch: function (a) {
            return 5 <
                LevelCalculator.getMissionLevel("World Design")
        },
        category: b,
        categoryDisplayName: c
    };
    a.realisticWeather = {
        id: "Realistic Weather",
        name: "Realistic weather".localize(),
        v: 6,
        canResearch: function (a) {
            return 6 < LevelCalculator.getMissionLevel("World Design")
        },
        category: b,
        categoryDisplayName: c
    };
    a.dynamicWorld = {
        id: "Dynamic World",
        name: "Dynamic world".localize(),
        v: 8,
        canResearch: function (a) {
            return 7 < LevelCalculator.getMissionLevel("World Design")
        },
        category: b,
        categoryDisplayName: c
    };
    a.worldDesignItems = [a.openWorld,
    a.dayNightCycle, a.richBackStory, a.virtualEconomy, a.realisticWeather, a.dynamicWorld
    ];
    b = "Level Design";
    c = "Level Design".localize();
    a.levelEditor = {
        id: "Level editor",
        name: "Level editor".localize(),
        v: 1,
        canResearch: function (a) {
            return 2 < LevelCalculator.getMissionLevel("Level Design")
        },
        category: b,
        categoryDisplayName: c
    };
    a.easterEggs = {
        id: "Easter Eggs",
        name: "Easter eggs".localize(),
        v: 2,
        canResearch: function (a) {
            return 4 < LevelCalculator.getMissionLevel("Level Design")
        },
        category: b,
        categoryDisplayName: c
    };
    a.miniGames = {
        id: "Mini Games",
        name: "Mini games".localize(),
        v: 4,
        canResearch: function (a) {
            return 5 < LevelCalculator.getMissionLevel("Level Design")
        },
        category: b,
        categoryDisplayName: c
    };
    a.dynamicEnvironment = {
        id: "Dynamic Environment",
        name: "Dynamic environment".localize(),
        v: 6,
        canResearch: function (a) {
            return 6 < LevelCalculator.getMissionLevel("Level Design")
        },
        category: b,
        categoryDisplayName: c
    };
    a.noLoadingScreens = {
        id: "No loading screens",
        name: "No loading screens".localize(),
        v: 8,
        canResearch: function (a) {
            return 7 < LevelCalculator.getMissionLevel("Level Design")
        },
        category: b,
        categoryDisplayName: c
    };
    a.levelDesignItems = [a.levelEditor, a.easterEggs, a.miniGames, a.dynamicEnvironment, a.noLoadingScreens];
    a.StartEngineParts = [a.textGraphics, a.TwoDGraphicsV1, a.simpleSounds];
    a.MediumSizeGames = {
        id: "MediumSizeGames",
        name: "Medium Games".localize(),
        pointsCost: 10,
        duration: 1E4,
        cost: 15E4,
        canResearch: function (a) {
            return 1 < a.staff.length
        },
        category: "Project Management",
        categoryDisplayName: "Project Management".localize()
    };
    a.LargeSizeGames = {
        id: "LargeGames",
        name: "Large Games".localize(),
        pointsCost: 40,
        duration: 15E3,
        cost: 3E5,
        canResearch: function (a) {
            return 14E4 < a.fans && 4 < a.staff.length
        },
        category: "Project Management",
        categoryDisplayName: "Project Management".localize()
    };
    b = "Game Design";
    c = "Game Design".localize();
    a.TargetAudience = {
        id: "TargetAudience",
        name: "Target Audience".localize(),
        pointsCost: 15,
        duration: 1E4,
        cost: 3E4,
        canResearch: function (a) {
            return -1 != a.scheduledStoriesShown.indexOf("TargetAudiences")
        },
        category: b,
        categoryDisplayName: c
    };
    a.Sequels = {
        id: "Sequels",
        name: "Sequels".localize(),
        pointsCost: 20,
        duration: 13E3,
        cost: 8E4,
        devCost: 2E4,
        canResearch: function (a) {
            return a.isLaterOrEqualThan(8, 6)
        },
        category: b,
        categoryDisplayName: c
    };
    a.CasualGames = {
        id: "CasualGames",
        name: "Casual games".localize(),
        category: b,
        categoryDisplayName: c,
        pointsCost: 20,
        duration: 1E4,
        cost: 25E3,
        canResearch: function (a) {
            return a.isLaterOrEqualThan(3, 10)
        }
    };
    a.Marketing = {
        id: "Marketing",
        name: "Marketing".localize(),
        category: "Publishing",
        categoryDisplayName: "Publishing".localize(),
        pointsCost: 40,
        duration: 1E4,
        cost: 5E4,
        canResearch: function (a) {
            return -1 !=
                a.scheduledStoriesShown.indexOf("MarketingStory")
        },
        complete: function () {
            Tutorial.marketingUnlocked()
        }
    };
    a.MultiGenre = {
        id: "MultiGenre",
        name: "Multi genre".localize(),
        category: b,
        categoryDisplayName: c,
        pointsCost: 80,
        duration: 1E4,
        cost: 35E3,
        canResearch: function (a) {
            return a.isLaterOrEqualThan(12, 8)
        }
    };
    a.expansionPack = {
        id: "expansionPack",
        name: "Expansion pack".localize(),
        category: b,
        categoryDisplayName: c,
        pointsCost: 150,
        duration: 1E4,
        cost: 1E5,
        canResearch: function (a) {
            return a.canDevelopMMOGames() && a.isMMOInSale()
        }
    };
    a.MultiPlatform = {
        id: "MultiPlatform",
        name: "Multi-Platform".localize(),
        category: "Technology",
        categoryDisplayName: "Technology".localize(),
        pointsCost: 100,
        duration: 15E3,
        cost: 5E5,
        canResearch: function (a) {
            return a.isLaterOrEqualThan(17, 2)
        }
    };
    a.SpecialItems = [a.TargetAudience, a.MediumSizeGames, a.LargeSizeGames, a.Sequels, a.CasualGames, a.Marketing, a.MultiGenre, a.expansionPack, a.MultiPlatform];
    b = "DRM";
    f = "drm";
    c = "DRM".localize();
    d = "Copy Protection V{0}".localize();
    a.DRMV1 = {
        id: "DRMV1",
        name: d.format(1),
        v: 2,
        canResearch: function (a) {
            return a.flags.pirateMode
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        showXPGain: !0
    };
    a.DRMV2 = {
        id: "DRMV2",
        name: d.format(2),
        v: 4,
        canResearch: function (a) {
            return a.flags.pirateMode && 2 < LevelCalculator.getFeatureLevel(a, "DRMV1")
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        showXPGain: !0
    };
    a.DRMV3 = {
        id: "DRMV3",
        name: d.format(3),
        v: 6,
        canResearch: function (a) {
            return a.flags.pirateMode && 2 < LevelCalculator.getFeatureLevel(a, "DRMV2")
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        showXPGain: !0
    };
    a.DRMV4 = {
        id: "DRMV4",
        name: d.format(4),
        v: 8,
        canResearch: function (a) {
            return a.flags.pirateMode &&
                2 < LevelCalculator.getFeatureLevel(a, "DRMV3")
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        showXPGain: !0
    };
    a.DRMV5 = {
        id: "DRMV5",
        name: d.format(5),
        v: 10,
        canResearch: function (a) {
            return a.flags.pirateMode && 2 < LevelCalculator.getFeatureLevel(a, "DRMV4")
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        showXPGain: !0
    };
    a.DRMV6 = {
        id: "DRMV6",
        name: d.format(6),
        v: 12,
        canResearch: function (a) {
            return a.flags.pirateMode && 2 < LevelCalculator.getFeatureLevel(a, "DRMV5")
        },
        category: b,
        categoryDisplayName: c,
        group: f,
        showXPGain: !0
    };
    a.DRMItems = [a.DRMV1, a.DRMV2, a.DRMV3, a.DRMV4, a.DRMV5, a.DRMV6];
    a.getAllItems = function () {
        return a.BasicItems.concat(a.engineItems).concat(a.gameplayItems).concat(a.storyItems).concat(a.dialogItems).concat(a.levelDesignItems).concat(a.aiItems).concat(a.worldDesignItems).concat(a.graphicItems).concat(a.soundItems).concat(a.SpecialItems).concat(a.ProductPlacement1).concat(a.DRMItems)
    };
    a.getUsableFeatureList = function (a, b) {
        for (var c = [], d = 0; d < b.length; d++) {
            var f = b[d];
            (void 0 === f.canUse || f.canUse(a)) && c.push(f)
        }
        return c
    };
    a.ProductPlacement1 = {
        id: "ProductPlacement1",
        name: "Red Exploding Barrels".localize(),
        cost: 5E3,
        d: 0,
        t: 0,
        category: "Special Items",
        categoryDisplayName: "Special Items".localize()
    };
    a.OneTimeItems = [a.ProductPlacement1];
    Research.getPointsCost = function (a) {
        if (!a.v) return a.pointsCost;
        var b = [1, 2, 4, 6, 8, 10, 12, 14].indexOf(a.v);
        if (-1 == b) throw "invalid v";
        b = [10, 15, 40, 80, 100, 150, 250, 300][b];
        a.pointsCostAdjustment && (b += a.pointsCostAdjustment);
        return b
    };
    Research.getDuration = function (a) {
        if (!a.v) return a.duration;
        a = [1,
            2, 4, 6, 8, 10, 12, 14
        ].indexOf(a.v);
        if (-1 == a) throw "invalid v";
        return 1E3 * [8, 10, 12, 14, 16, 20, 25, 30][a]
    };
    Research.getDevCost = function (a, b) {
        if (!a.v) return a.cost;
        var c = [1, 2, 4, 6, 8, 10, 12, 14].indexOf(a.v);
        if (-1 == c) throw "invalid v";
        c = 1E3 * [5, 10, 30, 60, 100, 150, 300, 400][c];
        b && (c = c * General.getGameSizeDurationFactor(b.gameSize) * General.getMultiPlatformCostFactor(b), c = 1E3 * Math.floor(c / 1E3));
        return c
    };
    Research.getResearchCost = function (a) {
        return a.cost ? a.cost : 4 * Research.getDevCost(a)
    };
    Research.getEnginePoints = function (a) {
        if (a.enginePoints) return a.enginePoints;
        if (!a.v) return 0;
        a = [1, 2, 4, 6, 8, 10, 12, 14].indexOf(a.v);
        if (-1 == a) throw "invalid v";
        return [10, 15, 30, 40, 80, 120, 200, 300][a]
    };
    Research.getEngineCost = function (a) {
        if (0 === a.enginePoints) return 0;
        if (a.engineCost) return a.engineCost;
        if (!a.v) return 0;
        a = [1, 2, 4, 6, 8, 10, 12, 14].indexOf(a.v);
        if (-1 == a) throw "invalid v";
        return 1E3 * [10, 30, 50, 100, 140, 180, 350, 500][a]
    }
})();
(function () {
    Research.consoleItems = []
})();
(function () {
    var a = Research;
    a._checkForNewLabResearch = function (b) {
        if (b.flags.rndLabUnlocked) {
            var c = "";
            b.flags.bigProjectsResearchActiveShown || (b.flags.bigProjectsResearchActiveShown = []);
            for (var k = 0; k < a.bigProjects.length; k++) {
                var m = a.bigProjects[k];
                m.canResearch(b) && -1 == b.flags.bigProjectsResearchActiveShown.indexOf(m.id) && (b.flags.bigProjectsResearchActiveShown.push(m.id), c += "\n" + m.name)
            }
            0 < c.length && (c = new Notification("R&D lab".localize(), "New research available:".localize() + " \n" + c, {
                type: NotificationType.NewResearchAvailable
            }),
                b.notifications.push(c))
        }
    };
    var b = 2,
        c = "Lab report".localize();
    a.opportunityInternet = {
        id: "opportunityInternet",
        name: "Internet Opportunities".localize(),
        pointsCost: 500,
        canResearch: function (b) {
            return -1 == b.researchCompleted.indexOf(a.opportunityInternet)
        },
        iconUri: "./images/projectIcons/superb/internet.png",
        description: "The internet will change our lives forever. This project will investigate how we can use the internet to make better games and deliver better experiences. Completing this project should unlock new options for research.".localize(),
        targetZone: b,
        complete: function (b) {
            b.researchCompleted.push(a.opportunityInternet);
            var d = "After careful examination we come to the conclusion that the internet is a huge opportunity in the gaming industry. We already see some small signs how successful multiplayer games can be but multiplayer is usually an additional feature to a game and not the main focus.{n}We think we could develop technologies to create a massively multiplayer online game (short MMO), a game where tens of thousands of players can play together. To create such an MMO more research is necessary.{n}The second discovery is that we could start developing an online distribution platform. Instead of players buying games in local stores they could download games directly from our servers. This would cut out the middle man and we could gain a large share of the market and additional income to fund our developments.".localize(),
                d = new Notification(c, d, {
                    type: NotificationType.Others,
                    image: a.opportunityInternet.iconUri
                });
            b.notifications.push(d)
        }
    };
    a.grid = {
        id: "Grid",
        name: "Codename: Grid".localize(),
        pointsCost: 1200,
        canResearch: function (b) {
            return !b.flags.grid && -1 != b.researchCompleted.indexOf(a.opportunityInternet) && b.researchCompleted.indexOf(a.grid)
        },
        iconUri: "./images/projectIcons/superb/grid.png",
        description: "A bold plan to develop an internet-based distribution platform for games. Rather than buying games through retailers players worldwide can simply download them. The platform features digital rights management to combat piracy and also enables a new market for smaller developers to show off their products.".localize(),
        targetZone: b,
        complete: function (b) {
            b.researchCompleted.push(a.grid);
            var d = b.licencedPlatforms.some(function (a) {
                return a.isCustom
            }),
                k = "Boss, it is done and it is live! Grid is the name of our very own internet-based distribution platform.".localize() + " ",
                k = d ? k + "Since we already have our own console we have integrated this service into our console. This should boost our market share considerably.".localize() : k + "This system should boost the market share of the PC considerably and if we ever have our own console it will also be of great benefit.".localize(),
                k = k + ("{n}" + "Grid will generate income every month which should boost our ability to create new games and develop new projects.".localize());
            b.flags.grid = !0;
            b.notifications.push(new Notification(c, k, {
                type: NotificationType.Others,
                image: a.grid.iconUri
            }))
        }
    };
    a.ownConvention = {
        id: "ownConvention",
        name: "Own Convention".localize(),
        pointsCost: 500,
        canResearch: function (a) {
            return 1E6 <= a.fans && !a.flags.customConference || a.isLaterOrEqualThan(23)
        },
        iconUri: "./images/projectIcons/superb/convention.png",
        description: "It's all well and good to have a booth at the yearly game convention and show off our products but with our large fan base we should consider staging our very own convention instead!".localize(),
        targetZone: b,
        complete: function (b) {
            b.flags.customConference = !0;
            var d = "Boss, we have completed the organization of our own convention.".localize(),
                d = new Notification(c, d, {
                    type: NotificationType.Others,
                    image: a.ownConvention.iconUri
                });
            b.notifications.push(d)
        }
    };
    a.ThreeDGraphicsV6Project = {
        id: "3D Graphics V6 Project",
        name: "3D Graphics V6".localize(),
        pointsCost: 1200,
        canResearch: function (a) {
            return !a.flags.graphicsV6 && 3 < LevelCalculator.getEnginePartLevel(a, "3D Graphics V5")
        },
        iconUri: "./images/projectIcons/superb/graphics-v6.png",
        description: "Pushing the boundaries of photorealism this revolutionary graphics engine will blow away everything that has come before. Near infinite draw distance, ultra-high polygon counts and realistic particle and volumetric effects.".localize(),
        targetZone: b,
        complete: function (b) {
            b.flags.graphicsV6 = !0;
            b.researchCompleted.push(a.ThreeDGraphicsV6);
            b.notifications.push(new Notification({
                header: c,
                text: "We have successfully completed the research on our next generation graphics technology and we can now start building a game engine to make use of this research.".localize(),
                image: "./images/projectIcons/superb/graphics-v6.png"
            }))
        }
    };
    a.ThreeDGraphicsV7PRoject = {
        id: "3D Graphics V7 Project",
        name: "3D Graphics V7".localize(),
        pointsCost: 1600,
        canResearch: function (a) {
            return !a.flags.graphicsV7 && 3 < LevelCalculator.getEnginePartLevel(a, "3D Graphics V6")
        },
        iconUri: "./images/projectIcons/superb/graphics-v7.png",
        description: "The ultimate in graphics technology. This will look better than reality. If anyone ever builds a holodeck then this is the graphics engine it would run on.".localize(),
        targetZone: b,
        complete: function (b) {
            b.flags.graphicsV7 = !0;
            b.researchCompleted.push(a.ThreeDGraphicsV7);
            b.notifications.push(new Notification({
                header: c,
                text: "We have done it! Our research was successful and we should be able to support our concepts for the ultimate graphics technology in our next game engine. This will be a revolution for the gaming industry!".localize(),
                image: "./images/projectIcons/superb/graphics-v7.png"
            }))
        }
    };
    a.sublicenseEngines = {
        id: "sublicenseEngines",
        name: "License Game Engines".localize(),
        pointsCost: 1500,
        canResearch: function (b) {
            return 10 <= b.engines.length && -1 == b.researchCompleted.indexOf(a.sublicenseEngines)
        },
        iconUri: "./images/projectIcons/superb/license-engine.png",
        description: "We have a lot of experience in creating custom game engines. Why not sub-license our engines to other developers? Not only will this cement our market position as a technology leader but it will also help offset the growing costs of developing engines.".localize(),
        targetZone: b,
        complete: function (b) {
            b.researchCompleted.push(a.sublicenseEngines)
        }
    };
    a.hardware = {
        id: "hardware",
        name: "Hardware".localize(),
        pointsCost: 800,
        canResearch: function (a) {
            return !a.flags.customHardwareResearched
        },
        iconUri: "./images/projectIcons/superb/hw-lab.png",
        description: "Software doesn't run without hardware. We are experts in creating software but why not also investigate whether we can create our own hardware?".localize(),
        targetZone: b,
        complete: function (b) {
            b.flags.customHardwareResearched = !0;
            var d = b.staff.some(function (a) {
                return a.flags.technologySpecialist
            }),
                k = "Our research is complete. There is definitely a big opportunity ahead of us. If we create our own hardware lab and have the appropriate technology specialists to run it then we could even create our very own gaming console!{n}It would not be cheap and it will probably take us a few years but maybe we could even trump the likes of an mBox or the Playsystem!".localize();
            d || (k += "{n}" + "Before we can think about creating this lab we need at least one technology specialist on our team so this should be our priority.".localize());
            d = new Notification(c, k, {
                image: a.hardware.iconUri
            });
            b.notifications.push(d)
        }
    };
    a.MMO = {
        id: "MMO",
        name: "MMO".localize(),
        pointsCost: 1700,
        canResearch: function (b) {
            return -1 == b.researchCompleted.indexOf(a.MMO) && -1 != b.researchCompleted.indexOf(a.opportunityInternet)
        },
        iconUri: "./images/projectIcons/superb/mmo.png",
        description: "Massively Multiplayer Online games! We know how much fun it is to play multiplayer games but imagine that instead of playing with a handful of players you could play with thousands! This project will unlock a brand new genre to allow you to create MMO games.".localize(),
        targetZone: b,
        complete: function (b) {
            b.researchCompleted.push(a.MMO);
            var d = "Boss, our research into massively multiplayer online (MMO) games is complete. The possibilities of MMOs are big but they are also risky. In our research we realized that before we can begin to develop an MMO we will need to create a special game engine for it.{n}You will need to complete the research for the MMO support feature with one of your staff. Once it is integrated into a game engine you can start building an MMO but be careful. It seems that MMOs only work with the best theme/genre combinations and you will also need to have specialists on your team to make an MMO successful.".localize(),
                d = new Notification(c, d, {
                    image: a.MMO.iconUri
                });
            b.notifications.push(d)
        }
    };
    a.AAA = {
        id: "AAA",
        name: "AAA Games".localize(),
        pointsCost: 2E3,
        canResearch: function (b) {
            return -1 == b.researchCompleted.indexOf(a.AAA) && b.gameLog.some(function (a) {
                return 10 === a.score && "large" === a.gameSize
            })
        },
        iconUri: "./images/projectIcons/superb/aaa.png",
        description: "We have proven that we can make large games work. How about we see how we can make games that are so massive in scope and of such high quality that they will create an entire new label. To borrow a term from the finance sector they will be triple A rated games or to borrow from the movie industry, true blockbusters.".localize(),
        targetZone: b,
        complete: function (b) {
            b.researchCompleted.push(a.AAA);
            var d = "Boss, our research into AAA games is complete and we can now begin to create AAA games. A triple A game requires well-trained staff and it is best to have specialists in the different areas to make sure the team does their best work.{n}When creating a AAA game we can also use the R&D lab to develop a special marketing campaign which greatly enhances the hype around the game.".localize();
            b.flags.hwLabUnlocked && (d += "\n" + "The hardware lab can also be used to develop special hardware products such as keyboard, mice and headsets that are sold with the game.".localize());
            d = new Notification(c, d, {
                image: a.AAA.iconUri
            });
            b.notifications.push(d)
        }
    };
    a.AAAMarketingCampaign = {
        id: "AAAMarketingCampaign",
        name: "Marketing Campaign".localize(),
        pointsCost: 1E3,
        canResearch: function (a) {
            return a.currentGame && "aaa" == a.currentGame.gameSize && !a.currentGame.flags.AAAMarketingCompleted
        },
        iconUri: "./images/projectIcons/superb/aaa-marketing.png",
        description: "Let's use our in-house skills to design a special marketing campaign for our AAA title.".localize(),
        targetZone: b,
        complete: function (a) {
            a.currentGame &&
                (a.currentGame.flags.AAAMarketingCompleted = !0)
        },
        cancel: function (a) {
            a.currentGame && (a.currentGame.flags.AAAMarketingCompleted = !0)
        },
        isRepeatable: !0
    };
    b = 0;
    a.AAACustomHardware = {
        id: "AAACustomHardware",
        name: "Custom Hardware".localize(),
        pointsCost: 1E3,
        canResearch: function (a) {
            return a.flags.hwLabUnlocked && a.currentGame && "aaa" == a.currentGame.gameSize && !a.currentGame.flags.AAACustomHardwareCompleted
        },
        iconUri: "./images/projectIcons/superb/aaa-hardware.png",
        description: "Let's use our in-house hardware lab to design and develop special hardware products to coincide with the release of our AAA title.".localize(),
        targetZone: b,
        complete: function (a) {
            a.currentGame && (a.currentGame.flags.AAACustomHardwareCompleted = !0)
        },
        cancel: function (a) {
            a.currentGame && (a.currentGame.flags.AAACustomHardwareCompleted = !0)
        },
        isRepeatable: !0
    };
    a.bigProjects = [a.AAAMarketingCampaign, a.AAACustomHardware, a.ownConvention, a.opportunityInternet, a.grid, a.ThreeDGraphicsV6Project, a.ThreeDGraphicsV7PRoject, a.sublicenseEngines, a.hardware, a.MMO, a.AAA]
})();
var Training = {};
(function () {
    var a = Training;
    a.getAvailableTraining = function (b) {
        for (var f = [], d = a.getAllTrainings(), k = 0; k < d.length; k++) {
            var m = d[k];
            m.canSee && m.canSee(b, GameManager.company) || void 0 === m.canUse ? f.push(m) : !m.canSee && m.canUse(b, GameManager.company) && f.push(m)
        }
        return f
    };
    a.getAllTrainings = function () {
        var c = [];
        c.addRange(b());
        for (var f in a)
            if (a.hasOwnProperty(f)) {
                var d = a[f];
                void 0 != d.id && void 0 != d.pointsCost && void 0 != d.duration && (d.isTraining = !0, c.push(d))
            } return c
    };
    category = "Management";
    categoryDisplayName =
        "Management".localize();
    a.managementL1 = {
        id: "Management1",
        name: "Staff Management".localize(),
        cost: 25E3,
        pointsCost: 0,
        duration: 12E3,
        canUse: function (a, b) {
            return 0 == a.id && 2 <= b.currentLevel && 1 === b.maxStaff
        },
        complete: function (a) {
            a = "Well done!\nYou've successfully completed your management course and you are now able to hire your very first employee!\n To get started close this message and then {0} the 'Fill Position...' button which is visible near the big desk.".localize();
            a = a.format(Tutorial.getClickVerb());
            GameManager.company.maxStaff = 5;
            GameManager.company.notifications.push(new Notification("Training Complete".localize(), a, "OK".localize()));
            VisualsManager.refreshHiringButtons()
        },
        category: category,
        categoryDisplayName: categoryDisplayName
    };
    a.WelcomeTraining = {
        id: "WelcomeTraining",
        name: "Staff Welcome Training".localize(),
        pointsCost: 0,
        cost: 1E4,
        duration: 5E3,
        canUse: function (a, b) {
            return !a.flags.didWelcomeTraining && a.flags.hiredTimestamp && a.flags.hiredTimestamp > GameManager.gameTime - 3E4
        },
        tick: function (a, b) {
            a.adjustEfficiency(b /
                5E3 * 0.2)
        },
        complete: function (a) {
            a.flags.didWelcomeTraining = !0
        },
        category: "Special",
        categoryDisplayName: "Special".localize()
    };
    a.patchGame = {
        id: "PatchGame",
        name: "Develop patch".localize(),
        duration: 8E3,
        pointsCost: 0,
        isTraining: !0,
        canUse: function () {
            return !1
        },
        complete: function (a) {
            VisualsManager.getCharacterOverlay(a).saySomething("patch complete".localize(), 1500);
            a = GameManager.company;
            var b = a.flags.patchData.fansChange,
                d = a.flags.patchData.gameName,
                k = a.notifications.first(function (a) {
                    return a.flags && a.flags.isPatchNotification
                });
            k ? (k.text = "{0} has recently released a much needed patch for {1}.\nOne fan said: 'I love companies like {0}. They don't just milk their customers for more money but also understand our concerns and make sure that we can enjoy our games!'.".localize().format(a.name, d), k.adjustFans(b)) : (a.notifications.push(new Notification("News".localize(), "It seems that {0} has finally released their patch for {1}. One fan said: 'I can't believe it took them so long to release a patch! I surely hope that they are more efficient next time!'".localize().format(a.name,
                d), "OK".localize())), a.adjustFans(Math.floor(b / 2)))
        }
    };
    a.postMortem = {
        id: "postMortem",
        name: void 0,
        baseDuration: 7E3,
        duration: 7E3,
        pointsCost: 0,
        isTraining: !0,
        progressColor: "purple",
        canUse: function () {
            return !1
        },
        tick: function (b, f) {
            var d = b.currentResearch;
            if (void 0 === d.lastSpawnTick) d.lastSpawnTick = 0, d.targetRPoints = d.duration / a.postMortem.baseDuration * b.researchFactor * 10, d.targetRPoints += 0.25 * d.targetRPoints * GameManager.company.getRandom(), d.currentRPoints = 0, d.nextCheck = 200 + 250 * GameManager.company.getRandom();
            else {
                var k = d.duration * d.progress;
                if (k - d.lastSpawnTick >= d.nextCheck) {
                    d.lastSpawnTick = k;
                    var m = d.targetRPoints * d.progress;
                    if (Math.floor(m) > Math.floor(d.currentRPoints)) {
                        for (var m = Math.floor(m - d.currentRPoints), l = 0; l < m; l++) b.spawnPoints(1, "r", 50 * l);
                        d.currentRPoints += m
                    }
                    d.nextCheck = Math.min(d.duration - k - 50, 350 + 3E3 * GameManager.company.getRandom())
                }
            }
        },
        complete: function (a) {
            var b = a.flags.postMortemGameId,
                d = GameManager.company.getGameById(b);
            d && (d.flags.postMortemCompleted = !0, b = new Notification("{PostMortemComplete}",
                b), a.flags.postMortemGameId = null, GameManager.company.notifications.push(b), Tutorial.gameReportComplete(0.3))
        }
    };
    category = "Specialists";
    categoryDisplayName = "Specialists".localize();
    a.designSpecialist = {
        id: "designSpecialist",
        name: "Design Specialist (Req. 700 D)".localize(),
        category: category,
        categoryDisplayName: categoryDisplayName,
        cost: 5E6,
        pointsCost: 100,
        duration: 2E4,
        canSee: function (a, b) {
            return 4 == b.currentLevel && b.flags.dTSpecialistTrainingEnabled && !a.flags.designSpecialist && !a.flags.technologySpecialist
        },
        canUse: function (a, b) {
            return 700 <= a.getDesignSkillPoints()
        },
        complete: function (a) {
            a.flags.designSpecialist = !0;
            Tutorial.additionalSpecialists(10)
        },
        style: "trainingItemSmall"
    };
    a.techSpecialist = {
        id: "techSpecialist",
        name: "Technology Specialist (Req. 700 T)".localize(),
        category: category,
        categoryDisplayName: categoryDisplayName,
        cost: 5E6,
        pointsCost: 100,
        duration: 2E4,
        canSee: function (a, b) {
            return 4 == b.currentLevel && b.flags.dTSpecialistTrainingEnabled && !a.flags.designSpecialist && !a.flags.technologySpecialist
        },
        canUse: function (a,
            b) {
            return 700 <= a.getTechnologySkillPoints()
        },
        complete: function (a) {
            a.flags.technologySpecialist = !0
        },
        style: "trainingItemSmall"
    };
    a.boostL1 = {
        id: "BoostL1",
        name: "Boost (Req. D:500 or T:500)".localize(),
        cost: 1E6,
        pointsCost: 20,
        duration: 15E3,
        canSee: function (a) {
            return 0 == a.maxBoostLevel && 5 <= a.getLevel()
        },
        canUse: function (a, b) {
            return 500 <= a.getDesignSkillPoints() || 500 <= a.getTechnologySkillPoints()
        },
        complete: function (a) {
            a.maxBoostLevel = 2;
            a.boostLevel = 0;
            a.boostRechargeProgress = 0;
            UI._resetBoostUI();
            Tutorial.boosts()
        },
        category: "Special",
        categoryDisplayName: "Special".localize()
    };
    a.boostL2 = {
        id: "BoostL2",
        name: "Boost Max. Level 3 (Req. D:700 or T:700)".localize(),
        cost: 2E6,
        pointsCost: 50,
        duration: 15E3,
        canSee: function (a) {
            return 2 == a.maxBoostLevel && 6 <= a.getLevel()
        },
        canUse: function (a, b) {
            return 700 <= a.getDesignSkillPoints() || 700 <= a.getTechnologySkillPoints()
        },
        complete: function (a) {
            a.maxBoostLevel = 3
        },
        category: "Special",
        categoryDisplayName: "Special".localize(),
        style: "trainingItemSmall"
    };
    var b = function () {
        for (var a = [], b = Missions.getAllMissions().filter(function (a) {
            return "dev" ===
                a.missionType
        }), d = 0; d < b.length; d++) {
            var k = b[d],
                m = Math.round(900 * k.designFactor),
                l = Math.round(900 * k.technologyFactor);
            (function (b, d, f) {
                var k = {
                    id: "specialization_" + f.id,
                    category: "Specialization",
                    categoryDisplayName: "Specialization".localize(),
                    name: "{0} [Req. {1}D/{2}T]".localize().format(f.name, b, d),
                    cost: 5E6,
                    pointsCost: 200,
                    duration: 2E4,
                    canSee: function (a) {
                        return 7 <= a.getLevel() && !a.flags.expert
                    },
                    canUse: function (a) {
                        return 500 * a.technologyFactor > d && 500 * a.designFactor > b
                    },
                    complete: function (a) {
                        a.flags.expert =
                            f.id;
                        VisualsManager.getCharacterOverlay(a).refreshName()
                    },
                    isTraining: !0,
                    style: "trainingItemSmall"
                };
                a.push(k)
            })(m, l, k)
        }
        return a
    };
    a.codingContest = {
        id: "codingContest",
        name: "Coding contest".localize(),
        duration: 3E4,
        pointsCost: 0,
        basePoints: 12,
        isTraining: !0,
        isSkillTraining: !0,
        tF: 0.2,
        dF: 0.2,
        rF: 1,
        sF: 0.3,
        qF: 0,
        maxP: 900,
        canUse: function () {
            return !1
        },
        complete: function (a) {
            VisualsManager.getCharacterOverlay(a).saySomething("done".localize("word appears on top of staff when they finish a coding contest"), 1500);
            a.flags.codingContestDone =
                GameManager.gameTime;
            DecisionNotifications.codingContestParticipationFinished()
        },
        category: "Skills"
    };
    category = "Teach and learn";
    categoryDisplayName = "Teach and learn".localize();
    a.designTraining3 = {
        id: "designTraining3",
        name: "Game Design Course".localize(),
        cost: 14E4,
        pointsCost: 30,
        duration: 2E4,
        basePoints: 13,
        tF: 0.2,
        dF: 1,
        rF: 0.1,
        sF: 0,
        qF: 0,
        maxP: 900,
        canUse: function (a, b) {
            return b.flags.trainingV3Enabled
        },
        category: category,
        categoryDisplayName: categoryDisplayName,
        isSkillTraining: !0
    };
    a.techTraining3 = {
        id: "techTraining3",
        name: "Programming Course".localize(),
        cost: 14E4,
        pointsCost: 30,
        duration: 2E4,
        basePoints: 13,
        tF: 1,
        dF: 0.2,
        rF: 0.1,
        sF: 0,
        qF: 0,
        maxP: 900,
        canUse: function (a, b) {
            return b.flags.trainingV3Enabled
        },
        category: category,
        categoryDisplayName: categoryDisplayName,
        isSkillTraining: !0
    };
    a.speedTraining3 = {
        id: "speedTraining3",
        name: "Product Management Course".localize(),
        cost: 14E4,
        pointsCost: 30,
        duration: 2E4,
        basePoints: 13,
        tF: 0.1,
        dF: 0.1,
        rF: 0.2,
        sF: 1,
        qF: 0,
        maxP: 900,
        canUse: function (a, b) {
            return b.flags.trainingV3Enabled
        },
        category: category,
        categoryDisplayName: categoryDisplayName,
        isSkillTraining: !0
    };
    a.researchTraining3 = {
        id: "researchTraining3",
        name: "R&D Course".localize(),
        cost: 14E4,
        pointsCost: 30,
        duration: 2E4,
        basePoints: 13,
        tF: 0.1,
        dF: 0.1,
        rF: 1,
        sF: 0.1,
        qF: 0,
        maxP: 900,
        canUse: function (a, b) {
            return b.flags.trainingV3Enabled
        },
        category: category,
        categoryDisplayName: categoryDisplayName,
        isSkillTraining: !0
    };
    category = "Practice, Practice, Practice";
    categoryDisplayName = "Practice, Practice, Practice".localize();
    a.designTraining2 = {
        id: "designTraining2",
        name: "G3 Pixel Cup".localize(),
        cost: 7E4,
        pointsCost: 10,
        duration: 2E4,
        basePoints: 12,
        tF: 0.2,
        dF: 1,
        rF: 0.1,
        sF: 0,
        qF: 0,
        maxP: 700,
        canUse: function (a, b) {
            return b.flags.trainingV2Enabled
        },
        category: category,
        categoryDisplayName: categoryDisplayName,
        isSkillTraining: !0
    };
    a.techTraining2 = {
        id: "techTraining2",
        name: "G3 Code Jam".localize(),
        cost: 7E4,
        pointsCost: 10,
        duration: 2E4,
        basePoints: 12,
        tF: 1,
        dF: 0.2,
        rF: 0.1,
        sF: 0,
        qF: 0,
        maxP: 700,
        canUse: function (a, b) {
            return b.flags.trainingV2Enabled
        },
        category: category,
        categoryDisplayName: categoryDisplayName,
        isSkillTraining: !0
    };
    a.holisticTraining2 = {
        id: "holisticTraining2",
        name: "G3 Game Jam".localize(),
        cost: 7E4,
        pointsCost: 10,
        duration: 2E4,
        basePoints: 12,
        tF: 0.5,
        dF: 0.5,
        rF: 0.1,
        sF: 0,
        qF: 0,
        maxP: 700,
        canUse: function (a, b) {
            return b.flags.trainingV2Enabled
        },
        category: category,
        categoryDisplayName: categoryDisplayName,
        isSkillTraining: !0
    };
    a.speedTraining2 = {
        id: "speedTraining2",
        name: "G3 Time Trials".localize(),
        cost: 7E4,
        pointsCost: 10,
        duration: 2E4,
        basePoints: 12,
        tF: 0.1,
        dF: 0.1,
        rF: 0.2,
        sF: 1,
        qF: 0,
        maxP: 700,
        canUse: function (a, b) {
            return b.flags.trainingV2Enabled
        },
        category: category,
        categoryDisplayName: categoryDisplayName,
        isSkillTraining: !0
    };
    a.researchTraining2 = {
        id: "researchTraining2",
        name: "G3 Innovation Challenge".localize(),
        cost: 7E4,
        pointsCost: 10,
        duration: 2E4,
        basePoints: 12,
        tF: 0.1,
        dF: 0.1,
        rF: 1,
        sF: 0.1,
        qF: 0,
        maxP: 700,
        canUse: function (a, b) {
            return b.flags.trainingV2Enabled
        },
        category: category,
        categoryDisplayName: categoryDisplayName,
        isSkillTraining: !0
    };
    category = "Book studies";
    categoryDisplayName = "Book studies".localize();
    a.holisticTraining = {
        id: "holisticTraining",
        name: "Game dev gems".localize(),
        cost: 15E3,
        pointsCost: 5,
        duration: 2E4,
        basePoints: 8,
        tF: 0.5,
        dF: 0.5,
        rF: 0.1,
        sF: 0.1,
        qF: 0,
        maxP: 500,
        canUse: function (a, b) {
            return !0
        },
        category: category,
        categoryDisplayName: categoryDisplayName,
        isSkillTraining: !0
    };
    a.researchTraining = {
        id: "researchTraining",
        name: "Make me think!".localize(),
        cost: 15E3,
        pointsCost: 5,
        duration: 2E4,
        basePoints: 8,
        tF: 0.1,
        dF: 0.1,
        rF: 1,
        sF: 0.1,
        qF: 0,
        maxP: 500,
        canUse: function (a, b) {
            return !0
        },
        category: category,
        categoryDisplayName: categoryDisplayName,
        isSkillTraining: !0
    };
    a.designTraining = {
        id: "designTraining",
        name: "Game design for pirates".localize(),
        cost: 15E3,
        pointsCost: 5,
        duration: 2E4,
        basePoints: 8,
        tF: 0.2,
        dF: 1,
        rF: 0.1,
        sF: 0,
        qF: 0,
        maxP: 500,
        canUse: function (a, b) {
            return !0
        },
        category: category,
        categoryDisplayName: categoryDisplayName,
        isSkillTraining: !0
    };
    a.speedTraining = {
        id: "speedTraining",
        name: "Don't repeat yourself".localize(),
        cost: 15E3,
        pointsCost: 5,
        duration: 2E4,
        basePoints: 8,
        tF: 0.1,
        dF: 0.1,
        rF: 0.2,
        sF: 1,
        qF: 0,
        maxP: 500,
        canUse: function (a, b) {
            return !0
        },
        category: category,
        categoryDisplayName: categoryDisplayName,
        isSkillTraining: !0
    };
    a.techTraining = {
        id: "techTraining",
        name: "Code incomplete".localize(),
        cost: 15E3,
        pointsCost: 5,
        duration: 2E4,
        basePoints: 8,
        tF: 1,
        dF: 0.2,
        rF: 0.1,
        sF: 0,
        qF: 0,
        maxP: 500,
        canUse: function (a, b) {
            return !0
        },
        category: category,
        categoryDisplayName: categoryDisplayName,
        isSkillTraining: !0
    }
})();
var Achievements = {};
(function () {
    var a = Achievements,
        b = [];
    a.resetAchievements = function () {
        var c = a.hasAchieved(a.supporter);
        DataStore.getAchievements().achieved = [];
        c && a.activate(a.supporter);
        b = []
    };
    a.complete = function (b) {
        a.areAchievementsDisabled() || (DataStore.getAchievements().achieved.push({
            id: b.id,
            time: Date.now()
        }), b.completed && b.completed(), Steam && Steam.activateAchievement(b.id, function () {
            Achievements.achievedOnSteam(b.id)
        }), DataStore.saveSettings())
    };
    a.activate = function (c) {
        if (!a.areAchievementsDisabled() && -1 == b.indexOf(c.id)) {
            try {
                ghg4.ghg5("achievement activated", {
                    id: c.id
                })
            } catch (f) {
                Logger.LogInfo("tagEvent failed", f)
            }
            b.push(c.id)
        }
    };
    a.hasAchieved = function (a) {
        return void 0 != DataStore.getAchievements().achieved.first(function (b) {
            return b.id === a.id
        })
    };
    a.achievedOnSteam = function (a) {
        var b = DataStore.getAchievements().achieved.first(function (b) {
            return b.id == a
        });
        void 0 != b && (b.s = !0);
        DataStore.saveSettings()
    };
    a.areAchievementsDisabled = function () {
        return GameManager.flags.achievementsDisabled
    };
    a.checkForAchievmentsNotCompletedOnSteam = function (b) {
        if (!a.areAchievementsDisabled()) try {
            if (GameFlags.IS_STEAM &&
                Steam && Steam.isAvailable()) {
                var c = !DataStore.getValue("steamAchievementResent");
                c && DataStore.setValue("steamAchievementResent", !0);
                var f = a.getAllItems(),
                    l = DataStore.getAchievements().achieved.map(function (a) {
                        return a.id
                    });
                for (b = 0; b < f.length; b++) {
                    var g = f[b];
                    if (-1 != l.indexOf(g.id)) {
                        var n = DataStore.getAchievements().achieved.map(function (a) {
                            return a
                        })[l.indexOf(g.id)];
                        n.s && !c || Steam.activateAchievement(n.id, function () {
                            Achievements.achievedOnSteam(n.id)
                        })
                    }
                }
                return []
            }
        } catch (r) { }
    };
    a.checkForNew = function (c) {
        if (a.areAchievementsDisabled() ||
            !c) return [];
        for (var f = [], m = a.getAllItems(), l = DataStore.getAchievements().achieved.map(function (a) {
            return a.id
        }), g = 0; g < m.length; g++) {
            var n = m[g]; - 1 == l.indexOf(n.id) && (n.isAchieved && n.isAchieved(c) ? f.push(n) : -1 != b.indexOf(n.id) && f.push(n))
        }
        return f
    };
    a.getAllItems = function () {
        var b = [],
            c;
        for (c in a)
            if (a.hasOwnProperty(c)) {
                var f = a[c];
                void 0 != f.id && b.push(f)
            } return b
    };
    a.getWidthId = function (b) {
        return a.getAllItems().first(function (a) {
            return a.id === b
        })
    };
    var c = "#78BA00",
        f = 10;
    a.goodCombo = {
        id: "goodCombo",
        title: "Good Judgement".localize("achievement title"),
        description: "Create a game with a good topic/genre combination.".localize("achievement"),
        isAchieved: function (a) {
            return (a = a.gameLog.last()) ? 1 === GameGenre.getGenreWeighting(a.topic.genreWeightings, a.genre, a.secondGenre) : !1
        },
        tint: c,
        value: f
    };
    a.cult = {
        id: "cult",
        title: "Cult Status".localize("achievement title"),
        description: "Set a new standard for the early gaming industry.".localize("achievement"),
        isAchieved: function (a) {
            var b = a.gameLog.last();
            return b && 3 === a.topScoreAchievements && b.flags.topScore && b.isOnSale() ?
                !0 : !1
        },
        tint: c,
        value: f
    };
    a.engine100K = {
        id: "engine100K",
        title: "100K Engine".localize("achievement title"),
        description: "Invest over 100K in a new game engine.".localize("achievement"),
        isAchieved: function (a) {
            return a.engines.some(function (a) {
                return 1E5 < a.costs
            })
        },
        tint: c,
        value: f
    };
    a.engine500K = {
        id: "engine500K",
        title: "500K Engine".localize("achievement title"),
        description: "Invest over 500K in a new game engine.".localize("achievement"),
        isAchieved: function (a) {
            return a.engines.some(function (a) {
                return 5E5 < a.costs
            })
        },
        tint: c,
        value: f
    };
    a.engine1M = {
        id: "engine1M",
        title: "1M Engine".localize("achievement title"),
        description: "Invest over one million in a new game engine.".localize("achievement"),
        isAchieved: function (a) {
            return a.engines.some(function (a) {
                return 1E6 < a.costs
            })
        },
        tint: c,
        value: f
    };
    c = "#FDD017";
    f = 50;
    a.gold = {
        id: "gold",
        title: "Gold".localize("achievement title"),
        description: "Sell half a million copies of a game without the help of a publisher.".localize("achievement"),
        isAchieved: function (a) {
            return a.gameLog.some(function (a) {
                return !a.flags.royaltyRate &&
                    5E5 <= a.unitsSold
            }) ? !0 : !1
        },
        tint: c,
        value: f
    };
    a.platinum = {
        id: "platinum",
        title: "Platinum".localize("achievement title"),
        description: "Sell one million copies of a game without the help of a publisher.".localize("achievement"),
        isAchieved: function (a) {
            return a.gameLog.some(function (a) {
                return !a.flags.royaltyRate && 1E6 <= a.unitsSold
            }) ? !0 : !1
        },
        tint: "#E5E4E2",
        value: 80
    };
    a.diamond = {
        id: "diamond",
        title: "Diamond".localize("achievement title"),
        description: "Sell ten million copies of a game without the help of a publisher.".localize("achievement"),
        isAchieved: function (a) {
            return a.gameLog.some(function (a) {
                return !a.flags.royaltyRate && 1E7 <= a.unitsSold
            }) ? !0 : !1
        },
        tint: "white",
        value: 100
    };
    a.unobtainium = {
        id: "unobtainium",
        title: "Unobtainium (seriously?)".localize("achievement title, refers to unobtanium, mocks the name of the rare mineral in the movie Avatar"),
        description: "Sell one hundred million copies of a game without the help of a publisher.".localize("achievement"),
        isAchieved: function (a) {
            return a.gameLog.some(function (a) {
                return !a.flags.royaltyRate &&
                    1E8 <= a.unitsSold
            }) ? !0 : !1
        },
        tint: "#F4F4F4",
        value: 250,
        hidden: !0
    };
    a.professional = {
        id: "professional",
        title: "Professional".localize("achievement title"),
        description: "Reach level 5 with a character.".localize("achievement"),
        isAchieved: function (a) {
            return a.staff.some(function (a) {
                return 1 == a.qualityFactor
            })
        },
        tint: c,
        value: f
    };
    a.legend = {
        id: "legend",
        title: "Legend".localize("achievement title"),
        description: "Reach level 10 with a character.".localize("achievement"),
        isAchieved: function (a) {
            return a.staff.some(function (a) {
                return 2 ==
                    a.qualityFactor
            })
        },
        tint: c,
        value: 100
    };
    a.diversity = {
        id: "diversity",
        title: "Diversity".localize("achievement title"),
        description: "Have male and female staff.".localize("achievement"),
        isAchieved: function (a) {
            for (var b, c = 1; c < a.staff.length; c++) {
                var f = a.staff[c].sex;
                void 0 === b && (b = f);
                if (f != b) return !0
            }
            return !1
        },
        tint: c,
        value: f
    };
    a.hireSomeoneFamous = {
        id: "hireSomeoneFamous",
        title: "Famous".localize("achievement title"),
        description: "Hire someone famous.".localize("achievement"),
        tint: c,
        value: f
    };
    a.fullHouse = {
        id: "fullHouse",
        title: "Full House".localize("achievement title"),
        description: "Have the maximum number of employees.".localize("achievement"),
        isAchieved: function (a) {
            return 7 === a.staff.length
        },
        tint: c,
        value: f
    };
    a.finishedGame = {
        id: "finishedGame",
        title: "Game Dev Tycoon".localize(),
        description: "Finish Game Dev Tycoon.".localize("achievement"),
        tint: c,
        value: 200
    };
    a.piracyLevel2 = {
        id: "piracyLevel2",
        title: "Statistical Anomaly".localize(),
        description: "Reach level 2 in pirate mode.".localize("achievement"),
        tint: c,
        value: 100,
        isAchieved: function (a) {
            return a.flags.pirateMode &&
                2 == a.currentLevel
        }
    };
    c = "#4E0000";
    a.perfectGame = {
        id: "perfectGame",
        title: "Perfect Game".localize("achievement title"),
        description: "Release a game with a clean score of 10.".localize("achievement"),
        isAchieved: function (a) {
            return (a = a.gameLog.last()) && 10 === a.reviews.average(function (a) {
                return a.score
            }) && a.isOnSale() && !a.flags.pGAEarned ? a.flags.pGAEarned = !0 : !1
        },
        tint: c,
        value: 100,
        canEarnMultiple: !0
    };
    a.perfectGame11 = {
        id: "perfectGame11",
        title: "Turn it up to 11".localize("achievement title"),
        description: "Get a reviewer to give you a 11/10 rating.".localize("achievement"),
        isAchieved: function (a) {
            return (a = a.gameLog.last()) && 10 < a.reviews.average(function (a) {
                return a.score
            }) && (a.isOnSale() || a.soldOut) && !a.flags.pGAEarned ? a.flags.pGAEarned = !0 : !1
        },
        tint: c,
        value: 100,
        canEarnMultiple: !0
    };
    a.againstAllOdds = {
        id: "againstAllOdds",
        title: "Against all odds".localize("achievement title"),
        description: "Beat all odds and finish the game in pirate mode.".localize("achievement"),
        tint: c,
        value: 100,
        canEarnMultiple: !0
    };
    c = "#F4B300";
    f = 150;
    a.easterEggs = {
        id: "easterEggs",
        title: "Detective".localize("achievement title"),
        description: "Find at least one of the easter eggs in the game.".localize("achievement"),
        isAchieved: function (a) {
            return !1
        },
        tint: c,
        value: f
    };
    a.lvl1EasterEgg = {
        id: "lvl1EasterEgg",
        title: "Treasure Hunter".localize("achievement title"),
        description: "Activate the hidden treasure in the garage.".localize("achievement"),
        isAchieved: function (a) {
            return !1
        },
        tint: c,
        value: f,
        hidden: !0,
        completed: function () {
            a.activate(a.easterEggs)
        }
    };
    a.lvl2Poster1 = {
        id: "lvl2Poster1",
        title: "Bluehair reporting for space duty".localize("achievement refers to Wing Commander, leave 'Bluehair'"),
        description: "Little known fact: Cats go all aggro in space.".localize("achievement refers to Wing Commander"),
        isAchieved: function (a) {
            return 2 != a.currentLevel ? !1 : (a = a.gameLog.last()) && ("Wing Commander" === a.title || "wing commander" === a.title)
        },
        tint: c,
        value: f,
        hidden: !0,
        completed: function () {
            a.activate(a.easterEggs)
        }
    };
    a.lvl2Poster2 = {
        id: "lvl2Poster2",
        title: "Welcome to Mars".localize("achievement title, refers to Doom"),
        description: "How did I get here? Why is there a chainsaw? Who cares!".localize("achievement refers to Doom"),
        isAchieved: function (a) {
            return 2 != a.currentLevel ? !1 : (a = a.gameLog.last()) && ("doom" === a.title || "DOOM" === a.title || "Doom" === a.title)
        },
        tint: c,
        value: f,
        hidden: !0,
        completed: function () {
            a.activate(a.easterEggs)
        }
    };
    a.lvl3Poster1 = {
        id: "lvl3Poster1",
        title: "Best ride to work ever".localize("achievement title, referes to half life"),
        description: "Workplace safety anyone?".localize("achievement referes to half life"),
        isAchieved: function (a) {
            return 3 != a.currentLevel ? !1 : (a = a.gameLog.last()) ? (a = a.title.toLowerCase(), "half life" ===
                a || "half-life" === a) : !1
        },
        tint: c,
        value: f,
        hidden: !0,
        completed: function () {
            a.activate(a.easterEggs)
        }
    };
    a.lvl3Poster2 = {
        id: "lvl3Poster2",
        title: "Welcome to your hospital".localize("achievement title, refers to Theme Hospital"),
        description: "Patients are reminded not to die in the corridors.".localize("achievement refers to Theme Hospital, use official translation for this."),
        isAchieved: function (a) {
            return 3 != a.currentLevel ? !1 : (a = a.gameLog.last()) && "Theme Hospital" === a.title || "theme hospital" === a.title
        },
        tint: c,
        value: f,
        hidden: !0,
        completed: function () {
            a.activate(a.easterEggs)
        }
    };
    a.lvl4Poster1 = {
        id: "lvl4Poster1",
        title: "Welcome Chief".localize("achievement title, refers to Halo"),
        description: "This world is round but different.".localize("achievement refers to Halo"),
        isAchieved: function (a) {
            return 4 == a.currentLevel && a.flags.rndLabUnlocked ? (a = a.gameLog.last()) && 0 === a.title.toLowerCase().indexOf("halo") : !1
        },
        tint: c,
        value: f,
        hidden: !0,
        completed: function () {
            a.activate(a.easterEggs)
        }
    };
    a.lvl4Poster2 = {
        id: "lvl4Poster2",
        title: "The sky is not the limit.".localize("achievement title, refers to Star Citizen"),
        description: "Welcome back Chris. We've missed you.".localize("achievement refers to Chris Roberts"),
        isAchieved: function (a) {
            return 4 == a.currentLevel && a.flags.rndLabUnlocked ? (a = a.gameLog.last()) && "star citizen" === a.title.toLowerCase() : !1
        },
        tint: c,
        value: f,
        hidden: !0,
        completed: function () {
            a.activate(a.easterEggs)
        }
    };
    a.lvl4Poster3 = {
        id: "lvl4Poster3",
        title: "Painting with nature.".localize("achievement title, refers to Okami"),
        description: "Pay homage to a specific Japanese video game.".localize("achievement refers to Okami"),
        isAchieved: function (a) {
            return 4 == a.currentLevel && a.flags.rndLabUnlocked ? (a = a.gameLog.last()) && "okami" === a.title.toLowerCase() || "\u014ckami" === a.title || "\u5927\u795e" === a.title : !1
        },
        tint: c,
        value: f,
        hidden: !0,
        completed: function () {
            a.activate(a.easterEggs)
        }
    };
    a.inception = {
        id: "inception",
        title: "Inception".localize("achievement title"),
        description: "Develop the game within the game.".localize("achievement, inception"),
        isAchieved: function (a) {
            return (a = a.gameLog.last()) && a.isOnSale() && a.genre.id === GameGenre.Simulation.id &&
                "Game Dev" === a.topic.id && "Game Dev Tycoon" === a.title ? !0 : !1
        },
        tint: c,
        value: f
    };
    a.fanBoy = {
        id: "fanboy",
        title: "Fan".localize(),
        description: "Pick an inspired company name.".localize("achievement"),
        tint: c,
        value: 50
    };
    f = 70;
    c = "#00AAAA";
    a.versatile = {
        id: "versatile",
        title: "Versatile".localize("achievement title"),
        description: "Release a successful game in each of the five main genres.".localize("achievement"),
        isAchieved: function (a) {
            for (var b = GameGenre.getAll().slice(0, 5), c = 0; c < a.gameLog.length; c++) {
                if (0 == b.length) return !0;
                var f = a.gameLog[c];
                7 <= f.score && -1 != b.indexOf(f.genre) && b.remove(f.genre)
            }
            return !1
        },
        tint: c,
        value: f
    };
    a.cake = {
        id: "cake",
        title: "Eat Cake".localize("achievement title"),
        description: "Show them red barrels some action.".localize("achievement"),
        tint: c,
        value: 100
    };
    a.supporter = {
        id: "supporter",
        title: "Supporter".localize("achievement title"),
        description: "Support a young start-up. Buy the game.".localize("achievement"),
        tint: "green",
        value: 1E3,
        isAchieved: function () {
            return !GameManager.ghg2()
        }
    };
    a.supporter2 = {
        id: "supporter2",
        title: "Greenheart",
        description: "Support Greenheart Games by buying an optional supporter pack.".localize("achievement"),
        tint: "green",
        value: 1E3,
        hidden: !0,
        canEarnMultiple: !0
    };
    c = "#FF981D";
    f = 100;
    a.admirer = {
        id: "admirer",
        title: "Admirer".localize("achievement title"),
        description: "Fun fact: We almost named our company Megaflop Productions!".localize("achievement, leave 'Megaflop Productions'"),
        tint: "green",
        hidden: !0,
        value: f
    };
    a.writersBlock = {
        id: "writersBlock",
        title: "Writer's Block".localize("achievement title"),
        description: "Naming games is sometimes difficult.".localize("achievement"),
        isAchieved: function (a) {
            return !1
        },
        tint: c,
        value: 20,
        hidden: !0
    }
})();