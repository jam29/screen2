# screen
kerawen afficheur

## enrollement

## upload
* Pour créer une ligne dans la base customer / table push ; faire un POST de
	* shop (domaine)
	* id_cash_drawer

* pour uploader l'image publicitaire et le logo faire un POST de
	* fichier (ext = jpeg/gif/png) 
	* nom du fichier ([pub|logo].ext)
	* shop
	* id_cash_drawer

# côté raspberry . Il y aura possibilité pour un raspberry de lancer un browser en mode kiosk et afficher l'écran (pub+logo+ticket de caisse dynamique)

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

* stopper screensaver

Ouvrir :

/etc/lightdm/lightdm.conf

Chercher :

#xserver-command=X

Remplacer par :

xserver-command=X -s 0 -dpms


