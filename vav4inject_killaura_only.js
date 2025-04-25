(function () {
    'use strict';

    let killauraEnabled = false;

    const injectCode = `
        let killauraEnabled = false;

        document.addEventListener("keydown", e => {
            if (e.key.toLowerCase() === "v") {
                const chatOpen = document.activeElement.tagName === "INPUT" || document.activeElement.tagName === "TEXTAREA";
                if (!chatOpen) {
                    killauraEnabled = !killauraEnabled;
                    console.log("KillAura: " + (killauraEnabled ? "ON" : "OFF"));
                }
            }
        });

        const originalUpdate = Player.prototype.update;
        Player.prototype.update = function () {
            if (killauraEnabled && this.isLocalPlayer) {
                const enemies = world.players.filter(p => p.team !== this.team && !p.isDead);
                let target = enemies.find(p => this.getDistance(p) < 4);
                if (target) {
                    this.attack(target);
                }
            }
            originalUpdate.call(this);
        };
    `;

    const observer = new MutationObserver(() => {
        const scripts = [...document.querySelectorAll("script")];
        const targetScript = scripts.find(s => s.src.includes("bundle") && !s.dataset.injected);
        if (targetScript) {
            targetScript.dataset.injected = "true";
            fetch(targetScript.src)
                .then(res => res.text())
                .then(code => {
                    const script = document.createElement("script");
                    script.textContent = code + "\\n" + injectCode;
                    document.body.appendChild(script);
                });
        }
    });

    observer.observe(document, { childList: true, subtree: true });
})();
