# screen
kerawen afficheur

## enrollement

* Pour créer une ligne dans la base screen; faire un POST de
	* shop (domaine)
	* id_cash_drawer

* pour uploader l'image publicitaire et le logo faire un POST de
	* fichier jpeg
	* nom du fichier ([pub|logo]_+id_shop.jpg)
	* shop
	* id_cash_drawer

## reception de tickets

* push d'un json ticket à chaque modification du ticket vers le serveur node. la syntaxe du push est:

	* socket.emit('ticket:url_longue:magasin:caisse', ticket)
# côté raspberry . Il y aura possibilité pour un raspberry de lancer un browser en mode kiosk et affichier l'écran (pub+logo+ticket de caissei dynamique)

* lancement de chromium and mode kiosk avec l'url:

cd /home/pi
cd .config
cd autostart

créer un fichier (ex: auto-chrome.desktop) et insérer ces paramètres 

[Desktop Entry]
Type=Application
Exec=/usr/bin/chromium-browser --noerrdialogs --disable-session-crashed-bubble --disable-infobars --kiosk https://screen.kerawen.com:3030/mag/See-gTlFoaB9r4KQVU_E
Hidden=false
X-GNOME-Autostart-enabled=true
Name[en_US]=AutoChromium
Name=AutoChromium

