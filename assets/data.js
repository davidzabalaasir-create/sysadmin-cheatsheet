/* =========================================================================
 * SysAdmin Cheat Sheet — Dataset
 * Mismo esquema que data/commands.example.json (embebido como JS para que
 * la app funcione abriendo index.html directamente, sin servidor).
 * ========================================================================= */
window.CHEATSHEET = {
  version: "1.9.1", // debe coincidir con APP_VERSION de index.html (ver AGENTS.md)
  categories: [
    { id: "users",      label: "Usuarios y Permisos",      labelEn: "User & Privilege Management", icon: "users",   os: ["linux", "windows"] },
    { id: "filesystem", label: "Archivos y Directorios",   labelEn: "File System",                 icon: "folder",  os: ["linux", "windows"] },
    { id: "network",    label: "Redes y Diagnóstico",      labelEn: "Networking & Troubleshooting",icon: "network", os: ["linux", "windows"] },
    { id: "processes",  label: "Procesos y Rendimiento",   labelEn: "Process & System Monitoring", icon: "cpu",     os: ["linux", "windows"] },
    { id: "security",   label: "Seguridad y Auditoría",    labelEn: "Security & Logs",             icon: "shield",  os: ["linux", "windows"] },
    { id: "automation", label: "Automatización y Tareas",  labelEn: "Automation & Crons",          icon: "clock",   os: ["linux", "windows"] },
    { id: "storage",    label: "Almacenamiento y Discos",  labelEn: "Storage & Disks",             icon: "disk",    os: ["linux", "windows"] },
    { id: "packages",   label: "Paquetes y Actualizaciones", labelEn: "Packages & Updates",       icon: "package", os: ["linux", "windows"] },
    { id: "containers",     label: "Contenedores y Kubernetes",  labelEn: "Containers & Kubernetes",          icon: "container", os: ["linux"] },
    { id: "git",            label: "Git y control de versiones", labelEn: "Git & Version Control",            icon: "git",       os: ["linux"] },
    { id: "virtualization", label: "Virtualización",             labelEn: "Virtualization",                   icon: "server",    os: ["linux", "windows"] },
    { id: "m365",           label: "Exchange y Microsoft 365",   labelEn: "Exchange & Microsoft 365",         icon: "cloud",     os: ["windows"] },
    { id: "netdevices",     label: "Equipos de red",             labelEn: "Network Devices (Cisco / MikroTik)", icon: "router",  os: ["network"] },
    { id: "packettracer",   label: "Cisco IOS · Packet Tracer",  labelEn: "Cisco IOS · Packet Tracer (CCNA)",  icon: "switch",    os: ["network"] },
    { id: "ad",       label: "Active Directory / LDAP",  labelEn: "Active Directory / LDAP",     icon: "tree",    os: ["windows"] }
  ],

  commands: [
    /* ============================ LINUX ============================ */

    // ---- Usuarios y permisos
    {
      id: "linux-useradd", name: "useradd", os: "linux", shell: "bash", category: "users", risk: "caution",
      description: "Crea una cuenta de usuario nueva con su directorio home, shell y grupos.",
      syntax: "useradd [opciones] usuario",
      flags: [
        { flag: "-m", description: "Crea el directorio home." },
        { flag: "-s /bin/bash", description: "Shell de inicio de sesión." },
        { flag: "-G grupo1,grupo2", description: "Grupos secundarios." },
        { flag: "-e AAAA-MM-DD", description: "Fecha de caducidad de la cuenta." }
      ],
      example: { command: "useradd -m -s /bin/bash -G sudo,docker -c \"Ana Ruiz - DevOps\" aruiz && passwd aruiz", explanation: "Alta de una administradora con home, bash, permisos sudo y acceso a Docker; después se le fija la contraseña." },
      tags: ["usuario", "alta", "crear", "cuenta", "adduser"]
    },
    {
      id: "linux-usermod", name: "usermod", os: "linux", shell: "bash", category: "users", risk: "caution",
      description: "Modifica una cuenta existente: grupos, bloqueo, shell o home.",
      syntax: "usermod [opciones] usuario",
      flags: [
        { flag: "-aG grupo", description: "Añade a un grupo SIN quitar los actuales (no olvides la -a)." },
        { flag: "-L / -U", description: "Bloquea / desbloquea la contraseña." },
        { flag: "-s /sbin/nologin", description: "Impide el inicio de sesión interactivo." },
        { flag: "-e 1", description: "Expira la cuenta inmediatamente." }
      ],
      example: { command: "usermod -L -e 1 -s /sbin/nologin exempleado", explanation: "Baja de un empleado: bloquea contraseña, expira la cuenta y quita la shell, conservando sus archivos para auditoría." },
      tags: ["grupo", "bloquear", "baja", "modificar", "lock"]
    },
    {
      id: "linux-chmod", name: "chmod", os: "linux", shell: "bash", category: "users", risk: "caution",
      description: "Cambia los permisos de lectura/escritura/ejecución (modo octal o simbólico).",
      syntax: "chmod [-R] MODO archivo",
      flags: [
        { flag: "-R", description: "Recursivo. Úsalo con cuidado en /." },
        { flag: "755 / 644 / 600", description: "rwxr-xr-x / rw-r--r-- / rw-------" },
        { flag: "u+x, g-w, o=", description: "Modo simbólico: usuario, grupo, otros." },
        { flag: "2775 / +t", description: "setgid en directorios compartidos / sticky bit." }
      ],
      example: { command: "find /srv/app -type d -exec chmod 750 {} + && find /srv/app -type f -exec chmod 640 {} +", explanation: "Normaliza permisos de una aplicación: directorios 750 y archivos 640, sin dar ejecución a todos los ficheros." },
      tags: ["permisos", "rwx", "octal", "acceso"]
    },
    {
      id: "linux-chown", name: "chown", os: "linux", shell: "bash", category: "users", risk: "caution",
      description: "Cambia el propietario y/o grupo de archivos y directorios.",
      syntax: "chown [-R] usuario[:grupo] archivo",
      flags: [
        { flag: "-R", description: "Aplica recursivamente." },
        { flag: "usuario:grupo", description: "Cambia propietario y grupo a la vez." },
        { flag: "--reference=f", description: "Copia el propietario de otro archivo." }
      ],
      example: { command: "chown -R www-data:www-data /var/www/html/wp-content/uploads", explanation: "Da al usuario del servidor web la propiedad de la carpeta de subidas de WordPress." },
      tags: ["propietario", "owner", "grupo"]
    },
    {
      id: "linux-sudo", name: "visudo", os: "linux", shell: "bash", category: "users", risk: "caution",
      description: "Edita /etc/sudoers con validación de sintaxis para evitar quedarte sin sudo.",
      syntax: "visudo [-f /etc/sudoers.d/archivo] [-c]",
      flags: [
        { flag: "-f", description: "Edita un fragmento en /etc/sudoers.d/." },
        { flag: "-c", description: "Solo comprueba la sintaxis." },
        { flag: "sudo -l -U user", description: "Lista qué puede ejecutar un usuario." }
      ],
      example: { command: "visudo -f /etc/sudoers.d/backup   # backup ALL=(root) NOPASSWD: /usr/bin/rsync", explanation: "Permite al usuario 'backup' ejecutar solo rsync como root sin contraseña (principio de mínimo privilegio)." },
      tags: ["sudo", "sudoers", "privilegios", "root"]
    },

    // ---- Archivos
    {
      id: "linux-find", name: "find", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Busca archivos recursivamente por nombre, tipo, tamaño, fecha o permisos y ejecuta acciones sobre ellos.",
      syntax: "find [ruta] [expresión] [acción]",
      flags: [
        { flag: "-name / -iname", description: "Por nombre (iname ignora mayúsculas)." },
        { flag: "-type f|d|l", description: "Archivo, directorio o enlace." },
        { flag: "-mtime +N", description: "Modificado hace más de N días." },
        { flag: "-size +100M", description: "Por tamaño." },
        { flag: "-exec cmd {} +", description: "Ejecuta un comando sobre los resultados." },
        { flag: "-delete", description: "Borra los resultados. Prueba antes sin él." }
      ],
      example: { command: "find /var/log -type f -name \"*.log\" -mtime +30 -size +50M -exec gzip {} +", explanation: "Comprime logs de más de 30 días y 50 MB para liberar espacio sin borrarlos." },
      tags: ["buscar", "archivos", "limpieza", "logs", "espacio"]
    },
    {
      id: "linux-rsync", name: "rsync", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Sincroniza archivos local o remotamente copiando solo diferencias. Base de muchos backups.",
      syntax: "rsync [opciones] origen/ destino/",
      flags: [
        { flag: "-a", description: "Modo archivo: recursivo, conserva permisos, fechas, enlaces." },
        { flag: "-vzP", description: "Verboso, comprime y muestra progreso / reanuda." },
        { flag: "--delete", description: "Borra en destino lo que no está en origen. ¡Cuidado!" },
        { flag: "-n / --dry-run", description: "Simula sin copiar nada." },
        { flag: "-e \"ssh -p 2222\"", description: "Transporte SSH personalizado." }
      ],
      example: { command: "rsync -avzP --delete --exclude='cache/' /srv/www/ backup@nas01:/backups/www/", explanation: "Espejo incremental de la web hacia el NAS por SSH. Ejecuta primero con -n para ver qué se borraría." },
      tags: ["copia", "backup", "sincronizar", "ssh", "espejo"]
    },
    {
      id: "linux-tar", name: "tar", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Empaqueta y comprime/descomprime archivos y directorios.",
      syntax: "tar -c|-x|-t [-z|-j|-J] -f archivo.tar.gz [rutas]",
      flags: [
        { flag: "-czf", description: "Crear archivo comprimido con gzip." },
        { flag: "-xzf ... -C dir", description: "Extraer en un directorio concreto." },
        { flag: "-tvf", description: "Listar contenido sin extraer." },
        { flag: "--exclude=patrón", description: "Excluye rutas." }
      ],
      example: { command: "tar -czf /backups/etc-$(hostname)-$(date +%F).tar.gz -C / etc", explanation: "Copia fechada de /etc antes de un cambio de configuración importante." },
      tags: ["comprimir", "backup", "empaquetar", "gzip", "extraer"]
    },
    {
      id: "linux-grep", name: "grep", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Busca patrones de texto (regex) dentro de archivos o de la salida de otros comandos.",
      syntax: "grep [opciones] 'patrón' [archivos]",
      flags: [
        { flag: "-r / -R", description: "Recursivo en directorios." },
        { flag: "-i", description: "Ignora mayúsculas." },
        { flag: "-n", description: "Muestra número de línea." },
        { flag: "-E", description: "Regex extendida." },
        { flag: "-v", description: "Invierte (líneas que NO coinciden)." },
        { flag: "-C N", description: "N líneas de contexto." }
      ],
      example: { command: "grep -rniE 'password|secret|api_key' /etc/myapp/ --include='*.conf'", explanation: "Audita archivos de configuración en busca de credenciales en texto plano." },
      tags: ["buscar", "texto", "regex", "filtrar", "patron"]
    },
    {
      id: "linux-rm", name: "rm -rf", os: "linux", shell: "bash", category: "filesystem", risk: "danger",
      description: "Elimina archivos y directorios de forma recursiva y forzada, sin papelera ni confirmación.",
      syntax: "rm [-r] [-f] [-i] ruta",
      flags: [
        { flag: "-r", description: "Recursivo." },
        { flag: "-f", description: "Fuerza, sin preguntar ni avisar de errores." },
        { flag: "-I", description: "Pregunta una vez antes de borrar muchos archivos." },
        { flag: "--preserve-root", description: "Por defecto: impide borrar /." }
      ],
      example: { command: "rm -rf -- \"/opt/app/releases/${OLD_RELEASE:?variable vacía}\"", explanation: "Borra una release antigua. ${VAR:?} aborta si la variable está vacía, evitando un desastroso 'rm -rf /opt/app/releases/'." },
      tags: ["borrar", "eliminar", "delete", "destructivo"]
    },

    {
      id: "linux-ls", name: "ls", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Lista el contenido de directorios con permisos, propietario, tamaño y fecha.",
      syntax: "ls [-lahtrRd] [ruta]",
      flags: [
        { flag: "-l", description: "Formato largo: permisos, enlaces, propietario, tamaño, fecha." },
        { flag: "-a", description: "Incluye archivos ocultos (que empiezan por punto)." },
        { flag: "-h", description: "Tamaños legibles (K, M, G)." },
        { flag: "-t / -r", description: "Ordena por fecha / invierte el orden." },
        { flag: "-S", description: "Ordena por tamaño." },
        { flag: "-d", description: "Muestra el directorio, no su contenido." }
      ],
      example: { command: "ls -lahtr /var/log | tail -n 15", explanation: "Muestra los 15 archivos de log modificados más recientemente: lo primero que se mira al investigar un fallo." },
      tags: ["listar", "dir", "archivos", "directorio", "permisos"]
    },
    {
      id: "linux-cp", name: "cp", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Copia archivos y directorios. Sobrescribe el destino sin avisar salvo que uses -i o -n.",
      syntax: "cp [-a] [-r] [-i|-n] [-v] origen destino",
      flags: [
        { flag: "-r", description: "Copia directorios recursivamente." },
        { flag: "-a", description: "Modo archivo: recursivo y conserva permisos, propietario, fechas y enlaces." },
        { flag: "-i / -n", description: "Pregunta antes de sobrescribir / nunca sobrescribe." },
        { flag: "-u", description: "Solo copia si el origen es más nuevo." },
        { flag: "--backup=numbered", description: "Guarda una copia numerada del destino si existe." }
      ],
      example: { command: "cp -a /etc/nginx/nginx.conf /etc/nginx/nginx.conf.bak-$(date +%F_%H%M)", explanation: "Copia de seguridad fechada de la configuración, conservando permisos, antes de editarla." },
      tags: ["copiar", "copy", "backup", "archivos", "duplicar"]
    },
    {
      id: "linux-mv", name: "mv", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Mueve o renombra archivos y directorios. Sobrescribe el destino sin preguntar por defecto.",
      syntax: "mv [-i|-n] [-v] [-b] origen destino",
      flags: [
        { flag: "-i", description: "Pregunta antes de sobrescribir." },
        { flag: "-n", description: "No sobrescribe nunca." },
        { flag: "-b", description: "Hace copia de seguridad del destino existente." },
        { flag: "-v", description: "Muestra cada operación." }
      ],
      example: { command: "mv -vn /home/compartido/*.pdf /srv/archivo/2026/", explanation: "Archiva los PDF sin pisar ningún archivo que ya exista con el mismo nombre en el destino." },
      tags: ["mover", "renombrar", "rename", "move", "archivos"]
    },
    {
      id: "linux-mkdir", name: "mkdir / touch", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Crea directorios (incluidos los intermedios) y archivos vacíos o actualiza su fecha.",
      syntax: "mkdir [-p] [-m modo] dir   |   touch archivo",
      flags: [
        { flag: "-p", description: "Crea los directorios padre necesarios; no falla si ya existe." },
        { flag: "-m 750", description: "Asigna permisos al crear." },
        { flag: "{a,b,c}", description: "Expansión de llaves para crear varios a la vez." },
        { flag: "touch -d '2 days ago'", description: "Fija una fecha de modificación concreta." }
      ],
      example: { command: "mkdir -p -m 750 /srv/app/{releases,shared/{logs,uploads},backups}", explanation: "Crea de una vez toda la estructura de despliegue de una aplicación con permisos restringidos." },
      tags: ["crear", "directorio", "carpeta", "archivo", "estructura"]
    },
    {
      id: "linux-ln", name: "ln -s", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Crea enlaces simbólicos (accesos directos) o enlaces duros a archivos y directorios.",
      syntax: "ln [-s] [-f] [-n] destino nombre_enlace",
      flags: [
        { flag: "-s", description: "Enlace simbólico (sin -s crea un enlace duro)." },
        { flag: "-f", description: "Reemplaza el enlace si ya existe." },
        { flag: "-n", description: "Trata un enlace a directorio como archivo (para reemplazarlo)." },
        { flag: "readlink -f", description: "Muestra a dónde apunta realmente un enlace." }
      ],
      example: { command: "ln -sfn /srv/app/releases/2026-11-07 /srv/app/current && readlink -f /srv/app/current", explanation: "Despliegue atómico: apunta 'current' a la nueva release. Para hacer rollback basta con volver a apuntar a la anterior." },
      tags: ["enlace", "symlink", "acceso directo", "link", "despliegue"]
    },
    {
      id: "linux-tail", name: "tail / less / cat", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Lee archivos de texto: final del archivo en tiempo real (tail -f), paginado con búsqueda (less) o completo (cat).",
      syntax: "tail [-n N] [-F] archivo | less [+F] archivo | cat archivo",
      flags: [
        { flag: "tail -n 100", description: "Últimas 100 líneas." },
        { flag: "tail -F", description: "Sigue el archivo aunque rote o se recree." },
        { flag: "less +F", description: "Modo seguimiento; Ctrl+C para buscar con /." },
        { flag: "head -n 20", description: "Primeras 20 líneas." },
        { flag: "cat -A", description: "Muestra caracteres ocultos (tabs, fin de línea Windows)." }
      ],
      example: { command: "tail -F /var/log/nginx/error.log | grep --line-buffered -i 'upstream'", explanation: "Sigue en directo el log de errores de Nginx mostrando solo los fallos de backend mientras reproduces el problema." },
      tags: ["leer", "log", "ver", "contenido", "seguir", "texto"]
    },
    {
      id: "linux-stat", name: "stat / file", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Metadatos detallados de un archivo (permisos, inodo, fechas de acceso/modificación/cambio) y detección de su tipo real.",
      syntax: "stat [-c formato] archivo | file archivo",
      flags: [
        { flag: "-c '%A %U:%G %s %y'", description: "Formato personalizado: permisos, dueño, tamaño, fecha." },
        { flag: "file -i", description: "Tipo MIME del archivo." },
        { flag: "file -s /dev/sdb1", description: "Detecta el sistema de archivos de un dispositivo." }
      ],
      example: { command: "stat -c '%n | %A | %U:%G | %y' /etc/passwd /etc/shadow /etc/sudoers", explanation: "Revisa permisos, propietario y última modificación de archivos críticos durante una auditoría." },
      tags: ["metadatos", "fecha", "inodo", "tipo", "auditoria"]
    },
    {
      id: "linux-sha256sum", name: "sha256sum", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Calcula y verifica hashes SHA-256 para comprobar la integridad de archivos descargados o copiados.",
      syntax: "sha256sum archivo... | sha256sum -c lista.sha256",
      flags: [
        { flag: "-c", description: "Verifica los hashes contra un archivo de sumas." },
        { flag: "--quiet", description: "Solo muestra los que fallan." },
        { flag: "md5sum / sha1sum", description: "Algoritmos antiguos (no usar para seguridad)." }
      ],
      example: { command: "sha256sum -c SHA256SUMS --ignore-missing", explanation: "Comprueba que la ISO descargada coincide con la suma publicada por el fabricante antes de instalarla." },
      tags: ["hash", "integridad", "checksum", "verificar", "md5"]
    },
    {
      id: "linux-diff", name: "diff", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Compara archivos o directorios línea a línea y muestra las diferencias.",
      syntax: "diff [-u] [-r] [-q] archivo1 archivo2",
      flags: [
        { flag: "-u", description: "Formato unificado (como los parches de git)." },
        { flag: "-r", description: "Compara directorios recursivamente." },
        { flag: "-q", description: "Solo indica qué archivos difieren." },
        { flag: "--color", description: "Resalta añadidos y eliminados." }
      ],
      example: { command: "diff -u --color /etc/ssh/sshd_config.bak /etc/ssh/sshd_config", explanation: "Revisa exactamente qué cambió en la configuración de SSH antes de reiniciar el servicio." },
      tags: ["comparar", "diferencias", "cambios", "configuracion"]
    },

    // ---- Redes
    {
      id: "linux-ss", name: "ss", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Muestra sockets: puertos en escucha, conexiones y el proceso propietario. Sustituto moderno de netstat.",
      syntax: "ss [opciones] [filtro]",
      flags: [
        { flag: "-t / -u", description: "TCP / UDP." },
        { flag: "-l", description: "Solo en escucha." },
        { flag: "-n", description: "Sin resolver nombres." },
        { flag: "-p", description: "Muestra el proceso (requiere root)." },
        { flag: "state established", description: "Filtra por estado." }
      ],
      example: { command: "ss -tunlp | grep -E ':(80|443|3306)\\b'", explanation: "Descubre qué proceso ocupa los puertos web/MySQL cuando un servicio falla con 'address already in use'." },
      tags: ["puertos", "sockets", "netstat", "conexiones", "listen"]
    },
    {
      id: "linux-ip", name: "ip", os: "linux", shell: "bash", category: "network", risk: "caution",
      description: "Gestiona interfaces, direcciones, rutas y vecinos (iproute2). Sustituye a ifconfig y route.",
      syntax: "ip [-br] [-c] addr|link|route|neigh <comando>",
      flags: [
        { flag: "-br -c a", description: "Resumen de IPs en color." },
        { flag: "route get IP", description: "Muestra qué ruta/interfaz usaría un destino." },
        { flag: "link set dev X up|down", description: "Activa/desactiva una interfaz." },
        { flag: "addr add IP/CIDR dev X", description: "Añade una IP (no persistente)." }
      ],
      example: { command: "ip route get 8.8.8.8 && ip -br -c addr", explanation: "Comprueba por qué gateway e interfaz sale el tráfico a Internet y las IPs de cada interfaz." },
      tags: ["ifconfig", "rutas", "interfaz", "ip", "gateway"]
    },
    {
      id: "linux-dig", name: "dig", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Consultas DNS detalladas: registros A, MX, TXT, NS, trazado de delegación.",
      syntax: "dig [@servidor] nombre [tipo] [+opciones]",
      flags: [
        { flag: "@1.1.1.1", description: "Consulta un servidor DNS concreto." },
        { flag: "+short", description: "Solo la respuesta." },
        { flag: "+trace", description: "Sigue la delegación desde la raíz." },
        { flag: "-x IP", description: "Resolución inversa (PTR)." }
      ],
      example: { command: "dig +short TXT _dmarc.empresa.com @8.8.8.8", explanation: "Verifica la política DMARC publicada vista desde un resolvedor público tras cambiar el DNS." },
      tags: ["dns", "nslookup", "registros", "mx", "resolver"]
    },
    {
      id: "linux-tcpdump", name: "tcpdump", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Captura y analiza tráfico de red en tiempo real con filtros BPF.",
      syntax: "tcpdump [-i iface] [-nn] [-w archivo.pcap] [filtro]",
      flags: [
        { flag: "-i eth0 / any", description: "Interfaz de captura." },
        { flag: "-nn", description: "Sin resolver hosts ni puertos." },
        { flag: "-w f.pcap", description: "Guarda para abrir en Wireshark." },
        { flag: "-c N", description: "Detiene tras N paquetes." },
        { flag: "host / port / net", description: "Filtros BPF." }
      ],
      example: { command: "tcpdump -i any -nn -c 200 'port 53 and host 10.0.0.15' -w dns-debug.pcap", explanation: "Captura el tráfico DNS de un cliente concreto para analizar fallos de resolución en Wireshark." },
      tags: ["captura", "sniffer", "paquetes", "pcap", "wireshark"]
    },
    {
      id: "linux-curl", name: "curl", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Cliente HTTP/HTTPS y más; imprescindible para probar APIs, certificados y tiempos de respuesta.",
      syntax: "curl [opciones] URL",
      flags: [
        { flag: "-I", description: "Solo cabeceras." },
        { flag: "-v", description: "Detalle de la conexión y TLS." },
        { flag: "-k", description: "Ignora errores de certificado (solo pruebas)." },
        { flag: "--resolve host:443:IP", description: "Fuerza la IP de un host sin tocar DNS." },
        { flag: "-w '%{time_total}'", description: "Métricas de tiempo." }
      ],
      example: { command: "curl -sS -o /dev/null -w 'HTTP %{http_code} en %{time_total}s\\n' --resolve app.empresa.com:443:10.0.5.20 https://app.empresa.com/health", explanation: "Prueba el health-check de un nodo concreto detrás del balanceador, saltándose el DNS." },
      tags: ["http", "api", "web", "tls", "wget"]
    },

    // ---- Netcat (Linux)
    {
      id: "linux-nc-scan", name: "nc -zv (comprobar puertos)", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Netcat como comprobador de puertos TCP/UDP: verifica si un puerto está abierto sin enviar datos.",
      syntax: "nc -zv [-u] [-w seg] host puerto|rango",
      flags: [
        { flag: "-z", description: "Modo escaneo: conecta y cierra sin enviar datos." },
        { flag: "-v", description: "Muestra si la conexión tuvo éxito o fue rechazada." },
        { flag: "-u", description: "Usa UDP en lugar de TCP (resultado menos fiable)." },
        { flag: "-w 2", description: "Tiempo de espera en segundos." },
        { flag: "20-25", description: "Rango de puertos." }
      ],
      example: { command: "for p in 22 80 443 3306 5432; do nc -zv -w 2 db01.corp.local $p; done 2>&1 | grep -E 'succeeded|open|refused|timed out'", explanation: "Comprueba de un vistazo qué servicios responden en un servidor cuando no tienes nmap instalado." },
      tags: ["netcat", "nc", "puerto", "escaneo", "telnet", "conectividad"]
    },
    {
      id: "linux-nc-transfer", name: "nc (transferir archivos)", os: "linux", shell: "bash", category: "network", risk: "caution",
      description: "Envía archivos o directorios entre dos equipos por TCP sin SSH ni SMB. El tráfico viaja SIN cifrar.",
      syntax: "receptor: nc -l [-p] puerto > archivo   |   emisor: nc host puerto < archivo",
      flags: [
        { flag: "-l", description: "Escucha conexiones entrantes." },
        { flag: "-p puerto", description: "Puerto local (necesario en algunas variantes de nc)." },
        { flag: "-q 1 / -N", description: "Cierra la conexión al terminar el envío (según variante)." },
        { flag: "| pv", description: "Muestra progreso de la transferencia." }
      ],
      example: { command: "# Receptor (srv02):\nnc -l -p 9000 | tar -xzf - -C /restore\n# Emisor (srv01):\ntar -czf - /srv/data | nc -q 1 srv02 9000", explanation: "Copia un directorio completo comprimido al vuelo entre dos servidores de una red aislada. Úsalo solo en redes de confianza: no hay cifrado." },
      tags: ["netcat", "nc", "transferir", "copiar", "archivos", "tar"]
    },
    {
      id: "linux-nc-listen", name: "nc -l (escucha de prueba)", os: "linux", shell: "bash", category: "network", risk: "caution",
      description: "Abre un puerto en escucha temporal para comprobar reglas de firewall o NAT antes de desplegar un servicio.",
      syntax: "nc -lvk [-u] [-p] puerto",
      flags: [
        { flag: "-l", description: "Modo escucha." },
        { flag: "-k", description: "Sigue escuchando tras cada conexión." },
        { flag: "-u", description: "Escucha UDP (útil para syslog, SNMP traps…)." },
        { flag: "-v", description: "Muestra quién se conecta." }
      ],
      example: { command: "# Servidor nuevo (antes de instalar la app):\nnc -lvk 8443\n# Desde el cliente:\necho 'hola desde cliente' | nc -w 3 app01.corp.local 8443", explanation: "Valida que el firewall y el balanceador dejan pasar el puerto 8443 antes de instalar la aplicación real." },
      tags: ["netcat", "nc", "firewall", "puerto", "listener", "udp"]
    },
    {
      id: "linux-nc-banner", name: "nc (banner / probar protocolo)", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Habla directamente con un servicio TCP en texto plano (SMTP, HTTP, Redis…) para ver su banner y respuesta.",
      syntax: "nc [-C] host puerto  |  printf 'petición' | nc host puerto",
      flags: [
        { flag: "-C", description: "Envía CRLF como fin de línea (SMTP, HTTP)." },
        { flag: "-w 5", description: "Cierra tras 5 s de inactividad." },
        { flag: "ncat --ssl", description: "Variante de Nmap con soporte TLS." }
      ],
      example: { command: "printf 'EHLO test.local\\r\\nQUIT\\r\\n' | nc -w 5 mail.corp.local 25", explanation: "Comprueba que el servidor SMTP responde y qué extensiones anuncia (STARTTLS, AUTH…)." },
      tags: ["netcat", "nc", "banner", "smtp", "http", "diagnostico"]
    },

    // ---- Procesos
    {
      id: "linux-ps", name: "ps", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Instantánea de los procesos en ejecución con su uso de CPU/memoria.",
      syntax: "ps aux | ps -eo campos --sort=-campo",
      flags: [
        { flag: "aux", description: "Todos los procesos, formato BSD." },
        { flag: "-ef --forest", description: "Árbol de procesos padre/hijo." },
        { flag: "-eo pid,user,%cpu,%mem,cmd", description: "Columnas personalizadas." },
        { flag: "--sort=-%mem", description: "Ordena descendente." }
      ],
      example: { command: "ps -eo pid,user,%cpu,%mem,etime,cmd --sort=-%mem | head -n 15", explanation: "Top 15 de procesos por consumo de RAM con su tiempo de vida: ideal para cazar fugas de memoria." },
      tags: ["procesos", "pid", "memoria", "cpu"]
    },
    {
      id: "linux-top", name: "top / htop", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Monitor interactivo en tiempo real de CPU, memoria, carga y procesos.",
      syntax: "top [-b] [-n N] [-u usuario] [-p PID]",
      flags: [
        { flag: "-b -n 1", description: "Modo batch, una iteración (para scripts)." },
        { flag: "-u user", description: "Solo procesos de un usuario." },
        { flag: "Shift+M / Shift+P", description: "Ordena por memoria / CPU (interactivo)." },
        { flag: "1", description: "Muestra cada núcleo por separado." }
      ],
      example: { command: "top -b -n 1 -o %CPU | head -n 20", explanation: "Captura no interactiva de los procesos con más CPU para adjuntarla a un ticket de incidencia." },
      tags: ["monitor", "carga", "load", "cpu", "rendimiento"]
    },
    {
      id: "linux-kill", name: "kill / pkill", os: "linux", shell: "bash", category: "processes", risk: "danger",
      description: "Envía señales a procesos. SIGKILL (-9) termina sin permitir limpieza.",
      syntax: "kill [-SEÑAL] PID | pkill [-SEÑAL] -f patrón",
      flags: [
        { flag: "-15 (TERM)", description: "Petición amable de terminar (por defecto)." },
        { flag: "-9 (KILL)", description: "Mata inmediatamente. Puede corromper datos." },
        { flag: "-HUP", description: "Muchos daemons recargan su configuración." },
        { flag: "pkill -u user", description: "Todos los procesos de un usuario." }
      ],
      example: { command: "pkill -TERM -f 'python3 worker.py' ; sleep 10 ; pkill -KILL -f 'python3 worker.py'", explanation: "Detiene workers colgados: primero TERM para un cierre limpio y solo si siguen vivos, KILL." },
      tags: ["matar", "señal", "terminar", "proceso", "colgado"]
    },
    {
      id: "linux-systemctl", name: "systemctl", os: "linux", shell: "bash", category: "processes", risk: "caution",
      description: "Controla servicios y unidades de systemd: arrancar, parar, habilitar y ver estado.",
      syntax: "systemctl start|stop|restart|reload|status|enable|disable unidad",
      flags: [
        { flag: "status nginx", description: "Estado y últimas líneas de log." },
        { flag: "enable --now", description: "Habilita al arranque e inicia ya." },
        { flag: "--failed", description: "Lista unidades fallidas." },
        { flag: "daemon-reload", description: "Recarga archivos de unidad modificados." }
      ],
      example: { command: "nginx -t && systemctl reload nginx && systemctl --no-pager status nginx", explanation: "Valida la config de Nginx, recarga sin cortar conexiones y verifica el estado." },
      tags: ["servicios", "systemd", "daemon", "arranque"]
    },
    {
      id: "linux-free-vmstat", name: "free / vmstat", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Uso de memoria y swap, y estadísticas de CPU, I/O y colas en intervalos.",
      syntax: "free -h | vmstat [intervalo] [conteo]",
      flags: [
        { flag: "free -h", description: "Memoria en formato legible." },
        { flag: "vmstat 2 5", description: "5 muestras cada 2 segundos." },
        { flag: "columna wa", description: "% de CPU esperando I/O (cuello de botella en disco)." },
        { flag: "columnas si/so", description: "Swap in/out: si > 0 constante, falta RAM." }
      ],
      example: { command: "free -h && vmstat -w 2 5", explanation: "Determina si la lentitud del servidor es por falta de RAM (swap) o por disco (wa alto)." },
      tags: ["memoria", "ram", "swap", "io", "rendimiento"]
    },

    // ---- Seguridad
    {
      id: "linux-iptables", name: "iptables", os: "linux", shell: "bash", category: "security", risk: "danger",
      description: "Administra reglas del firewall netfilter. Una regla mal puesta puede dejarte sin acceso SSH.",
      syntax: "iptables [-t tabla] -A|-I|-D|-L CADENA [match] -j OBJETIVO",
      flags: [
        { flag: "-L -n -v --line-numbers", description: "Lista reglas con contadores." },
        { flag: "-A / -I", description: "Añade al final / inserta al principio." },
        { flag: "-p tcp --dport 22", description: "Protocolo y puerto destino." },
        { flag: "-s 10.0.0.0/8", description: "Red de origen." },
        { flag: "-j ACCEPT|DROP|REJECT", description: "Acción." },
        { flag: "-P INPUT DROP", description: "Política por defecto." }
      ],
      example: { command: "iptables -I INPUT -p tcp -s 192.168.10.0/24 --dport 22 -m conntrack --ctstate NEW,ESTABLISHED -j ACCEPT", explanation: "Permite SSH solo desde la red de administración. Añádela ANTES de poner la política INPUT en DROP." },
      tags: ["firewall", "netfilter", "puertos", "nat", "bloquear", "ssh"]
    },
    {
      id: "linux-ufw", name: "ufw", os: "linux", shell: "bash", category: "security", risk: "caution",
      description: "Interfaz sencilla para el firewall (Ubuntu/Debian).",
      syntax: "ufw allow|deny|delete|status|enable [regla]",
      flags: [
        { flag: "status numbered", description: "Lista reglas numeradas." },
        { flag: "allow from IP to any port 22", description: "Regla por origen y puerto." },
        { flag: "limit ssh", description: "Limita intentos (anti fuerza bruta)." },
        { flag: "delete N", description: "Borra la regla N." }
      ],
      example: { command: "ufw allow from 192.168.10.0/24 to any port 22 proto tcp && ufw default deny incoming && ufw enable", explanation: "Endurece un servidor nuevo: solo SSH desde la red de gestión y todo lo demás entrante denegado." },
      tags: ["firewall", "ubuntu", "puertos", "reglas"]
    },
    {
      id: "linux-journalctl", name: "journalctl", os: "linux", shell: "bash", category: "security", risk: "safe",
      description: "Consulta los logs del journal de systemd con filtros por unidad, prioridad y fecha.",
      syntax: "journalctl [-u unidad] [-p prioridad] [--since] [-f]",
      flags: [
        { flag: "-u sshd", description: "Logs de una unidad." },
        { flag: "-p err", description: "Solo errores o peor." },
        { flag: "--since \"1 hour ago\"", description: "Rango de tiempo." },
        { flag: "-f", description: "Seguir en tiempo real." },
        { flag: "-b -1", description: "Arranque anterior." }
      ],
      example: { command: "journalctl -u ssh --since today | grep -i 'Failed password' | awk '{print $(NF-3)}' | sort | uniq -c | sort -nr | head", explanation: "Ranking de IPs con más intentos fallidos de SSH hoy: detecta ataques de fuerza bruta." },
      tags: ["logs", "auditoria", "systemd", "errores", "ssh"]
    },
    {
      id: "linux-last", name: "last / lastb", os: "linux", shell: "bash", category: "security", risk: "safe",
      description: "Historial de inicios de sesión correctos (last) y fallidos (lastb), reinicios incluidos.",
      syntax: "last [-n N] [-i] [usuario] | lastb",
      flags: [
        { flag: "-i", description: "Muestra IPs en lugar de nombres." },
        { flag: "-n 20", description: "Últimas 20 entradas." },
        { flag: "reboot", description: "Historial de reinicios." },
        { flag: "-F", description: "Fechas completas." }
      ],
      example: { command: "last -i -F -n 30 && lastb -i | head -n 20", explanation: "Revisión de accesos tras una alerta de seguridad: quién entró, desde dónde y qué intentos fallaron." },
      tags: ["login", "accesos", "auditoria", "sesiones", "wtmp"]
    },

    // ---- Automatización
    {
      id: "linux-crontab", name: "crontab", os: "linux", shell: "bash", category: "automation", risk: "caution",
      description: "Programa tareas periódicas por usuario con el formato min hora día mes díaSemana.",
      syntax: "crontab -e | -l | -r [-u usuario]",
      flags: [
        { flag: "-e", description: "Edita las tareas." },
        { flag: "-l", description: "Lista las tareas." },
        { flag: "-r", description: "¡BORRA todas las tareas sin preguntar!" },
        { flag: "*/5 * * * *", description: "Cada 5 minutos." },
        { flag: "@reboot", description: "Al arrancar." }
      ],
      example: { command: "30 2 * * * /usr/local/bin/backup.sh >> /var/log/backup.log 2>&1", explanation: "Ejecuta el backup cada día a las 02:30 y guarda salida y errores en un log." },
      tags: ["cron", "programar", "tareas", "planificar", "schedule"]
    },
    {
      id: "linux-systemd-timer", name: "systemd timers", os: "linux", shell: "bash", category: "automation", risk: "caution",
      description: "Alternativa moderna a cron con logs en journal, dependencias y ejecución recuperada (Persistent).",
      syntax: "systemctl list-timers | OnCalendar=... en unidad .timer",
      flags: [
        { flag: "list-timers --all", description: "Timers y próxima ejecución." },
        { flag: "OnCalendar=*-*-* 03:00", description: "Diario a las 03:00." },
        { flag: "Persistent=true", description: "Ejecuta si se perdió por estar apagado." },
        { flag: "systemd-analyze calendar", description: "Valida expresiones de calendario." }
      ],
      example: { command: "systemd-analyze calendar 'Mon..Fri 08:00' && systemctl enable --now backup.timer", explanation: "Comprueba la expresión de calendario y activa el timer de backup en días laborables." },
      tags: ["cron", "timer", "systemd", "programar"]
    },
    {
      id: "linux-xargs", name: "xargs", os: "linux", shell: "bash", category: "automation", risk: "caution",
      description: "Construye y ejecuta comandos a partir de la entrada estándar, incluso en paralelo.",
      syntax: "comando | xargs [-0] [-P N] [-I {}] cmd",
      flags: [
        { flag: "-0", description: "Entrada separada por NUL (con find -print0)." },
        { flag: "-P 4", description: "4 procesos en paralelo." },
        { flag: "-I {}", description: "Sustituye {} por cada elemento." },
        { flag: "-n 1", description: "Un argumento por ejecución." }
      ],
      example: { command: "cat servidores.txt | xargs -P 8 -I {} ssh -o ConnectTimeout=5 {} 'hostname; uptime'", explanation: "Consulta el uptime de una lista de servidores en paralelo (8 a la vez)." },
      tags: ["scripting", "paralelo", "pipe", "bucle", "masivo"]
    },

    // ---- Almacenamiento
    {
      id: "linux-df-du", name: "df / du", os: "linux", shell: "bash", category: "storage", risk: "safe",
      description: "Espacio libre por sistema de archivos (df) y tamaño de directorios (du).",
      syntax: "df -hT | du -xh --max-depth=1 ruta",
      flags: [
        { flag: "df -hT", description: "Legible y con tipo de FS." },
        { flag: "df -i", description: "Uso de inodos (disco 'lleno' con espacio libre)." },
        { flag: "du -sh *", description: "Tamaño de cada elemento." },
        { flag: "du -x", description: "No cruza a otros sistemas de archivos." }
      ],
      example: { command: "df -hT / && du -xh --max-depth=2 / 2>/dev/null | sort -rh | head -n 20", explanation: "Disco raíz al 95%: localiza los 20 directorios más grandes sin contar otros montajes." },
      tags: ["espacio", "disco", "lleno", "tamaño", "inodos"]
    },
    {
      id: "linux-lsblk", name: "lsblk / blkid", os: "linux", shell: "bash", category: "storage", risk: "safe",
      description: "Lista dispositivos de bloque, particiones, puntos de montaje y UUIDs.",
      syntax: "lsblk [-f] [-o columnas] | blkid",
      flags: [
        { flag: "-f", description: "Muestra FS, etiqueta y UUID." },
        { flag: "-o NAME,SIZE,TYPE,MOUNTPOINT", description: "Columnas personalizadas." },
        { flag: "blkid /dev/sdb1", description: "UUID para /etc/fstab." }
      ],
      example: { command: "lsblk -o NAME,SIZE,TYPE,FSTYPE,MOUNTPOINT,UUID", explanation: "Identifica el disco nuevo añadido a la VM y obtiene su UUID para montarlo de forma persistente." },
      tags: ["discos", "particiones", "uuid", "dispositivos"]
    },
    {
      id: "linux-mount", name: "mount", os: "linux", shell: "bash", category: "storage", risk: "caution",
      description: "Monta sistemas de archivos y recursos de red (NFS, CIFS).",
      syntax: "mount [-t tipo] [-o opciones] dispositivo punto_montaje",
      flags: [
        { flag: "-a", description: "Monta todo /etc/fstab (prueba tras editarlo)." },
        { flag: "-o remount,rw", description: "Remonta en lectura/escritura." },
        { flag: "-t nfs / cifs", description: "Recursos de red." },
        { flag: "findmnt", description: "Árbol de montajes actual." }
      ],
      example: { command: "echo 'UUID=xxxx /data ext4 defaults,nofail 0 2' >> /etc/fstab && mount -a && findmnt /data", explanation: "Montaje persistente con 'nofail' para que el servidor arranque aunque el disco falte. mount -a valida fstab antes de reiniciar." },
      tags: ["montar", "fstab", "nfs", "cifs", "smb"]
    },
    {
      id: "linux-lvextend", name: "lvextend", os: "linux", shell: "bash", category: "storage", risk: "caution",
      description: "Amplía un volumen lógico LVM y, opcionalmente, su sistema de archivos en caliente.",
      syntax: "lvextend -L +TAMAÑO | -l +100%FREE [-r] /dev/VG/LV",
      flags: [
        { flag: "-L +20G", description: "Añade 20 GB." },
        { flag: "-l +100%FREE", description: "Usa todo el espacio libre del VG." },
        { flag: "-r", description: "Redimensiona también el FS (ext4/xfs)." },
        { flag: "vgs / lvs", description: "Consulta espacio de VG y LV." }
      ],
      example: { command: "pvresize /dev/sda3 && lvextend -r -l +100%FREE /dev/ubuntu-vg/ubuntu-lv", explanation: "Tras ampliar el disco virtual en el hipervisor, extiende PV, LV y sistema de archivos sin reiniciar." },
      tags: ["lvm", "ampliar", "volumen", "resize"]
    },
    {
      id: "linux-mkfs", name: "mkfs / dd", os: "linux", shell: "bash", category: "storage", risk: "danger",
      description: "Formatea una partición (mkfs) o copia bloques en bruto (dd). Un dispositivo equivocado borra todos sus datos.",
      syntax: "mkfs.ext4 /dev/sdX1 | dd if=origen of=destino bs=4M",
      flags: [
        { flag: "mkfs.ext4 -L etiqueta", description: "Crea ext4 con etiqueta." },
        { flag: "mkfs.xfs -f", description: "Fuerza XFS sobre FS existente." },
        { flag: "dd status=progress", description: "Muestra progreso." },
        { flag: "dd conv=fsync", description: "Asegura escritura física." }
      ],
      example: { command: "lsblk && mkfs.ext4 -L datos /dev/sdb1", explanation: "Formatea el disco de datos nuevo. Ejecuta siempre lsblk antes y verifica DOS veces que /dev/sdb1 es el correcto." },
      tags: ["formatear", "format", "destructivo", "particion"]
    },

    /* =========================== WINDOWS =========================== */

    // ---- Usuarios y permisos
    {
      id: "win-net-user", name: "net user", os: "windows", shell: "cmd", category: "users", risk: "caution",
      description: "Gestiona cuentas locales o de dominio desde CMD: crear, desactivar, restablecer contraseñas.",
      syntax: "net user [usuario [contraseña | *] [/add | /delete] [/domain] [/active:yes|no]]",
      flags: [
        { flag: "/add", description: "Crea el usuario." },
        { flag: "/active:no", description: "Deshabilita la cuenta." },
        { flag: "/domain", description: "Opera contra el dominio." },
        { flag: "*", description: "Pide la contraseña sin mostrarla." }
      ],
      example: { command: "net user jlopez /domain", explanation: "Consulta rápida de una cuenta de dominio: grupos, último inicio de sesión y caducidad de contraseña." },
      tags: ["usuario", "cuenta", "local", "dominio", "cmd"]
    },
    {
      id: "win-new-localuser", name: "New-LocalUser", os: "windows", shell: "powershell", category: "users", risk: "caution",
      description: "Crea usuarios locales con PowerShell y los añade a grupos con Add-LocalGroupMember.",
      syntax: "New-LocalUser -Name <string> -Password <SecureString> [-FullName] [-PasswordNeverExpires]",
      flags: [
        { flag: "-Password (Read-Host -AsSecureString)", description: "Contraseña segura por consola." },
        { flag: "-AccountExpires", description: "Fecha de caducidad." },
        { flag: "Get-LocalUser", description: "Lista usuarios locales." },
        { flag: "Add-LocalGroupMember", description: "Añade a un grupo local." }
      ],
      example: { command: "New-LocalUser -Name 'svc_backup' -Password (Read-Host -AsSecureString) -FullName 'Servicio Backup'; Add-LocalGroupMember -Group 'Backup Operators' -Member 'svc_backup'", explanation: "Cuenta de servicio local para backups con solo los privilegios de Backup Operators." },
      tags: ["usuario", "local", "grupo", "powershell"]
    },
    {
      id: "win-icacls", name: "icacls", os: "windows", shell: "cmd", category: "users", risk: "caution",
      description: "Muestra y modifica las ACL NTFS de archivos y carpetas; permite backup/restore de permisos.",
      syntax: "icacls ruta [/grant|/deny|/remove usuario:(permisos)] [/T] [/inheritance:e|d|r]",
      flags: [
        { flag: "/grant \"Grupo\":(OI)(CI)M", description: "Modificar heredable a subcarpetas y archivos." },
        { flag: "/T", description: "Recursivo." },
        { flag: "/inheritance:r", description: "Quita la herencia." },
        { flag: "/save /restore", description: "Exporta e importa ACLs." }
      ],
      example: { command: "icacls D:\\Shares\\Finanzas /save C:\\acl_finanzas.txt /T && icacls D:\\Shares\\Finanzas /grant \"CORP\\GG_Finanzas\":(OI)(CI)M", explanation: "Respalda las ACL actuales y luego da permiso de Modificar al grupo de Finanzas en la carpeta compartida." },
      tags: ["permisos", "ntfs", "acl", "carpeta", "compartida"]
    },
    {
      id: "win-whoami", name: "whoami /all", os: "windows", shell: "cmd", category: "users", risk: "safe",
      description: "Muestra usuario, SID, grupos y privilegios del token actual.",
      syntax: "whoami [/user] [/groups] [/priv] [/all]",
      flags: [
        { flag: "/groups", description: "Grupos del token (incluye nivel de integridad)." },
        { flag: "/priv", description: "Privilegios habilitados." },
        { flag: "/upn", description: "Nombre principal de usuario." }
      ],
      example: { command: "whoami /groups | findstr /i \"admin High\"", explanation: "Comprueba si la consola está elevada (High Mandatory Level) y si eres miembro de un grupo de administradores." },
      tags: ["usuario", "sid", "privilegios", "token", "elevado"]
    },
    {
      id: "win-runas", name: "runas", os: "windows", shell: "cmd", category: "users", risk: "caution",
      description: "Ejecuta un programa con otras credenciales (p. ej. cuenta admin separada).",
      syntax: "runas /user:DOMINIO\\usuario [/netonly] \"programa\"",
      flags: [
        { flag: "/user:", description: "Cuenta a usar." },
        { flag: "/netonly", description: "Credenciales solo para acceso remoto." },
        { flag: "/savecred", description: "Guarda credenciales (evitar por seguridad)." }
      ],
      example: { command: "runas /netonly /user:CORP\\adm.jlopez \"mmc dsa.msc\"", explanation: "Abre Usuarios y Equipos de AD con la cuenta administrativa desde un equipo fuera del dominio." },
      tags: ["credenciales", "admin", "elevar", "sudo"]
    },

    // ---- Archivos
    {
      id: "win-robocopy", name: "robocopy", os: "windows", shell: "cmd", category: "filesystem", risk: "caution",
      description: "Copia robusta con reintentos, multihilo y conservación de ACL. /MIR puede borrar en destino.",
      syntax: "robocopy origen destino [archivos] [opciones]",
      flags: [
        { flag: "/MIR", description: "Espejo: incluye borrado en destino." },
        { flag: "/COPYALL /DCOPY:DAT", description: "Copia datos, ACL, propietario y auditoría." },
        { flag: "/MT:16", description: "16 hilos." },
        { flag: "/R:2 /W:5", description: "2 reintentos cada 5 s." },
        { flag: "/L", description: "Solo lista (simulacro)." },
        { flag: "/LOG+:archivo", description: "Log acumulativo." }
      ],
      example: { command: "robocopy \\\\FS01\\Datos \\\\FS02\\Datos /MIR /COPYALL /DCOPY:DAT /MT:16 /R:2 /W:5 /XD \"$RECYCLE.BIN\" /LOG+:C:\\Logs\\migracion.log", explanation: "Migración de un servidor de archivos a otro conservando permisos NTFS. Ejecuta primero con /L." },
      tags: ["copia", "migracion", "backup", "espejo", "xcopy"]
    },
    {
      id: "win-get-childitem", name: "Get-ChildItem", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "Lista archivos y carpetas (ls/dir) con filtros potentes; base de búsquedas e informes.",
      syntax: "Get-ChildItem [-Path] [-Filter] [-Recurse] [-File|-Directory] [-Force]",
      flags: [
        { flag: "-Recurse", description: "Recursivo." },
        { flag: "-Filter *.log", description: "Filtro rápido a nivel de proveedor." },
        { flag: "-Force", description: "Incluye ocultos y de sistema." },
        { flag: "-ErrorAction SilentlyContinue", description: "Ignora accesos denegados." }
      ],
      example: { command: "Get-ChildItem D:\\ -Recurse -File -ErrorAction SilentlyContinue | Sort-Object Length -Descending | Select-Object -First 20 FullName, @{n='MB';e={[math]::Round($_.Length/1MB,1)}}", explanation: "Los 20 archivos más grandes del disco D: con su tamaño en MB." },
      tags: ["ls", "dir", "buscar", "archivos", "tamaño"]
    },
    {
      id: "win-remove-item", name: "Remove-Item -Recurse -Force", os: "windows", shell: "powershell", category: "filesystem", risk: "danger",
      description: "Borra archivos y carpetas recursivamente sin confirmación ni papelera.",
      syntax: "Remove-Item -Path <ruta> [-Recurse] [-Force] [-WhatIf]",
      flags: [
        { flag: "-Recurse", description: "Incluye subcarpetas." },
        { flag: "-Force", description: "Incluye ocultos/solo lectura." },
        { flag: "-WhatIf", description: "Muestra qué borraría sin hacerlo." },
        { flag: "-Confirm", description: "Pide confirmación por elemento." }
      ],
      example: { command: "Get-ChildItem C:\\inetpub\\logs -Recurse -File | Where-Object LastWriteTime -lt (Get-Date).AddDays(-60) | Remove-Item -WhatIf", explanation: "Limpieza de logs de IIS con más de 60 días. Quita -WhatIf solo tras revisar la lista." },
      tags: ["borrar", "eliminar", "rm", "del", "destructivo"]
    },
    {
      id: "win-takeown", name: "takeown", os: "windows", shell: "cmd", category: "filesystem", risk: "caution",
      description: "Toma la propiedad de archivos/carpetas cuando ni el administrador tiene acceso.",
      syntax: "takeown /F ruta [/R] [/A] [/D Y]",
      flags: [
        { flag: "/F", description: "Archivo o carpeta." },
        { flag: "/R", description: "Recursivo." },
        { flag: "/A", description: "Asigna al grupo Administradores." },
        { flag: "/D Y", description: "Responde Sí automáticamente." }
      ],
      example: { command: "takeown /F \"D:\\Perfiles\\usuario_baja\" /R /A /D Y && icacls \"D:\\Perfiles\\usuario_baja\" /grant Administradores:F /T", explanation: "Recupera el acceso a la carpeta de un usuario dado de baja para archivar sus datos." },
      tags: ["propietario", "acceso denegado", "permisos", "owner"]
    },

    {
      id: "win-copy-item", name: "Copy-Item", os: "windows", shell: "powershell", category: "filesystem", risk: "caution",
      description: "Copia archivos y carpetas (alias cp/copy). Con -Force sobrescribe archivos existentes, incluidos los de solo lectura.",
      syntax: "Copy-Item -Path <origen> -Destination <destino> [-Recurse] [-Force] [-Filter] [-WhatIf]",
      flags: [
        { flag: "-Recurse", description: "Copia carpetas con su contenido." },
        { flag: "-Force", description: "Sobrescribe y copia ocultos/solo lectura." },
        { flag: "-Filter *.config", description: "Copia solo lo que coincide." },
        { flag: "-ToSession $s", description: "Copia a un equipo remoto por PowerShell Remoting." },
        { flag: "copy / xcopy", description: "Alternativas clásicas en CMD." }
      ],
      example: { command: "$s = New-PSSession -ComputerName web02; Copy-Item C:\\inetpub\\wwwroot\\web.config -Destination C:\\inetpub\\wwwroot\\ -ToSession $s -Force", explanation: "Replica un web.config a otro servidor IIS a través de WinRM, sin necesidad de recursos compartidos." },
      tags: ["copiar", "copy", "cp", "archivos", "remoto"]
    },
    {
      id: "win-move-item", name: "Move-Item / Rename-Item", os: "windows", shell: "powershell", category: "filesystem", risk: "caution",
      description: "Mueve o renombra archivos y carpetas (alias mv/move/ren). Combinado con Get-ChildItem permite renombrados masivos.",
      syntax: "Move-Item -Path <origen> -Destination <destino> [-Force]  |  Rename-Item -Path <ruta> -NewName <nombre>",
      flags: [
        { flag: "-Force", description: "Sobrescribe el destino si existe." },
        { flag: "-WhatIf", description: "Simula la operación." },
        { flag: "-NewName { ... }", description: "Calcula el nombre nuevo con un script block." },
        { flag: "move / ren", description: "Equivalentes en CMD." }
      ],
      example: { command: "Get-ChildItem D:\\Escaneos\\*.pdf | Rename-Item -NewName { '{0:yyyy-MM-dd}_{1}' -f $_.LastWriteTime, $_.Name } -WhatIf", explanation: "Prefija cada PDF con su fecha para ordenarlos cronológicamente. Revisa la simulación y quita -WhatIf." },
      tags: ["mover", "renombrar", "rename", "move", "masivo"]
    },
    {
      id: "win-new-item", name: "New-Item", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "Crea archivos, carpetas, enlaces simbólicos y uniones (alias ni / mkdir / md).",
      syntax: "New-Item -Path <ruta> -ItemType File|Directory|SymbolicLink|Junction [-Value] [-Force]",
      flags: [
        { flag: "-ItemType Directory", description: "Crea una carpeta (y las intermedias)." },
        { flag: "-ItemType File -Value 'texto'", description: "Crea un archivo con contenido." },
        { flag: "-ItemType SymbolicLink -Target", description: "Crea un enlace simbólico (requiere admin o modo desarrollador)." },
        { flag: "-Force", description: "No falla si existe (¡en archivos lo vacía!)." }
      ],
      example: { command: "'Logs','Backups','Scripts','Temp' | ForEach-Object { New-Item -Path \"D:\\Admin\\$_\" -ItemType Directory -Force | Out-Null }", explanation: "Crea la estructura estándar de carpetas de administración en un servidor recién instalado." },
      tags: ["crear", "carpeta", "directorio", "archivo", "mkdir"]
    },
    {
      id: "win-get-content", name: "Get-Content -Tail -Wait", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "Lee archivos de texto (alias cat/type/gc). Con -Wait sigue el archivo en tiempo real, como tail -f.",
      syntax: "Get-Content -Path <archivo> [-Tail N] [-Wait] [-TotalCount N] [-Encoding]",
      flags: [
        { flag: "-Tail 50", description: "Últimas 50 líneas." },
        { flag: "-Wait", description: "Sigue mostrando las líneas nuevas." },
        { flag: "-TotalCount 20", description: "Primeras 20 líneas." },
        { flag: "type archivo", description: "Equivalente en CMD." }
      ],
      example: { command: "Get-Content C:\\inetpub\\logs\\LogFiles\\W3SVC1\\u_ex$(Get-Date -Format yyMMdd).log -Tail 20 -Wait | Select-String ' 500 '", explanation: "Sigue en directo el log de IIS de hoy mostrando solo las peticiones que devuelven error 500." },
      tags: ["leer", "log", "tail", "cat", "type", "seguir"]
    },
    {
      id: "win-get-filehash", name: "Get-FileHash / certutil", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "Calcula el hash (SHA256 por defecto) de archivos para verificar su integridad.",
      syntax: "Get-FileHash -Path <archivo> [-Algorithm SHA256|SHA1|MD5]  |  certutil -hashfile archivo SHA256",
      flags: [
        { flag: "-Algorithm SHA256", description: "Algoritmo (por defecto SHA256)." },
        { flag: "-Path *.iso", description: "Varios archivos con comodines." },
        { flag: "certutil -hashfile", description: "Alternativa en CMD disponible en todas las versiones." }
      ],
      example: { command: "(Get-FileHash .\\SW_DVD9_Win_Server_2025.iso).Hash -eq '<hash publicado por Microsoft>'", explanation: "Devuelve True si la ISO descargada no está corrupta ni manipulada." },
      tags: ["hash", "integridad", "checksum", "sha256", "verificar"]
    },
    {
      id: "win-compress-archive", name: "Compress-Archive / tar", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "Crea y extrae archivos ZIP. Windows 10/Server 2019+ incluye también tar.exe nativo.",
      syntax: "Compress-Archive -Path <origen> -DestinationPath <zip> [-Update]  |  Expand-Archive -Path <zip> -DestinationPath <dir>",
      flags: [
        { flag: "-Update", description: "Añade o actualiza archivos en un ZIP existente." },
        { flag: "-CompressionLevel Optimal", description: "Nivel de compresión." },
        { flag: "Expand-Archive -Force", description: "Extrae sobrescribiendo." },
        { flag: "tar -czf / -xf", description: "tar.exe nativo; soporta .tar.gz y archivos > 2 GB." }
      ],
      example: { command: "Compress-Archive -Path C:\\Logs\\*.log -DestinationPath \"D:\\Archivo\\logs_$(Get-Date -Format yyyy-MM-dd).zip\" -CompressionLevel Optimal", explanation: "Archiva los logs del día en un ZIP fechado antes de purgarlos." },
      tags: ["zip", "comprimir", "descomprimir", "extraer", "tar"]
    },
    {
      id: "win-attrib", name: "attrib", os: "windows", shell: "cmd", category: "filesystem", risk: "caution",
      description: "Muestra o cambia los atributos de archivos: solo lectura, oculto, sistema y archivo.",
      syntax: "attrib [+|-R] [+|-H] [+|-S] [+|-A] [ruta] [/S] [/D]",
      flags: [
        { flag: "+R / -R", description: "Pone / quita solo lectura." },
        { flag: "+H / -H", description: "Oculta / muestra." },
        { flag: "+S / -S", description: "Marca / desmarca como archivo de sistema." },
        { flag: "/S /D", description: "Aplica a subcarpetas y a las propias carpetas." }
      ],
      example: { command: "attrib -H -S -R E:\\*.* /S /D", explanation: "Recupera archivos que un malware de USB ocultó marcándolos como sistema y ocultos." },
      tags: ["atributos", "oculto", "solo lectura", "usb", "archivos"]
    },
    {
      id: "win-mklink", name: "mklink", os: "windows", shell: "cmd", category: "filesystem", risk: "caution",
      description: "Crea enlaces simbólicos, enlaces duros o uniones de directorio (junctions). Requiere CMD como administrador.",
      syntax: "mklink [/D | /H | /J] enlace destino",
      flags: [
        { flag: "(sin opción)", description: "Enlace simbólico a archivo." },
        { flag: "/D", description: "Enlace simbólico a directorio." },
        { flag: "/J", description: "Unión de directorio (solo rutas locales)." },
        { flag: "/H", description: "Enlace duro a archivo." }
      ],
      example: { command: "robocopy C:\\ProgramData\\AppCache D:\\AppCache /MIR /COPYALL && rmdir /S /Q C:\\ProgramData\\AppCache && mklink /J C:\\ProgramData\\AppCache D:\\AppCache", explanation: "Libera espacio en C: moviendo una caché enorme a D: sin que la aplicación note el cambio. Detén la aplicación antes." },
      tags: ["enlace", "symlink", "junction", "acceso directo", "espacio"]
    },
    {
      id: "win-compare-object", name: "Compare-Object / fc", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "Compara el contenido de dos archivos o listas y muestra las diferencias.",
      syntax: "Compare-Object (Get-Content a) (Get-Content b) [-IncludeEqual]  |  fc archivo1 archivo2",
      flags: [
        { flag: "<= / =>", description: "Indicador de en qué lado está cada diferencia." },
        { flag: "-Property", description: "Compara por propiedad (p. ej. Name, Length)." },
        { flag: "fc /N", description: "En CMD, muestra números de línea." }
      ],
      example: { command: "Compare-Object (Get-ChildItem \\\\fs01\\Datos -Recurse -File) (Get-ChildItem \\\\fs02\\Datos -Recurse -File) -Property Name, Length", explanation: "Tras una migración, lista los archivos que faltan o tienen distinto tamaño entre el servidor viejo y el nuevo." },
      tags: ["comparar", "diferencias", "diff", "fc", "migracion"]
    },

    // ---- Redes
    {
      id: "win-test-netconnection", name: "Test-NetConnection", os: "windows", shell: "powershell", category: "network", risk: "safe",
      description: "Diagnóstico todo-en-uno: ping, prueba de puerto TCP, traceroute y ruta utilizada.",
      syntax: "Test-NetConnection [-ComputerName] <host> [-Port <int> | -CommonTCPPort <HTTP|RDP|SMB|WINRM>] [-TraceRoute]",
      flags: [
        { flag: "-Port", description: "Comprueba un puerto TCP." },
        { flag: "-CommonTCPPort RDP", description: "Atajo para puertos comunes." },
        { flag: "-TraceRoute", description: "Traceroute." },
        { flag: "-InformationLevel Quiet", description: "Solo True/False (scripts)." }
      ],
      example: { command: "Test-NetConnection sql01.corp.local -Port 1433 -InformationLevel Detailed", explanation: "Comprueba si el SQL acepta conexiones en 1433 y desde qué IP de origen sale el tráfico. Descarta problemas de firewall." },
      tags: ["tnc", "ping", "puerto", "telnet", "conectividad"]
    },
    {
      id: "win-netsh", name: "netsh", os: "windows", shell: "cmd", category: "network", risk: "caution",
      description: "Configuración de red de Windows: interfaces, IP, Wi-Fi, proxy WinHTTP y firewall.",
      syntax: "netsh <contexto> [subcontexto] <comando> [parámetros]",
      flags: [
        { flag: "interface ip show config", description: "Configuración IP." },
        { flag: "interface ip set address", description: "IP estática o DHCP." },
        { flag: "winhttp show proxy", description: "Proxy del sistema." },
        { flag: "int ip reset", description: "Restablece TCP/IP (requiere reinicio)." }
      ],
      example: { command: "netsh interface ip set address name=\"Ethernet\" static 192.168.1.50 255.255.255.0 192.168.1.1", explanation: "IP estática en el adaptador 'Ethernet'. Si estás por RDP en ese adaptador, perderás la sesión." },
      tags: ["red", "ip", "estatica", "proxy", "interfaz", "wifi"]
    },
    {
      id: "win-ipconfig", name: "ipconfig", os: "windows", shell: "cmd", category: "network", risk: "safe",
      description: "Muestra configuración IP y gestiona la caché DNS y las concesiones DHCP.",
      syntax: "ipconfig [/all] [/release] [/renew] [/flushdns] [/displaydns]",
      flags: [
        { flag: "/all", description: "Detalle completo: MAC, DNS, DHCP." },
        { flag: "/flushdns", description: "Vacía la caché DNS." },
        { flag: "/release /renew", description: "Renueva la IP DHCP." },
        { flag: "/registerdns", description: "Vuelve a registrar en DNS." }
      ],
      example: { command: "ipconfig /flushdns && ipconfig /registerdns", explanation: "Tras cambiar un registro DNS interno, limpia la caché del cliente y re-registra el equipo." },
      tags: ["ip", "dns", "dhcp", "cache", "red"]
    },
    {
      id: "win-get-nettcpconnection", name: "Get-NetTCPConnection", os: "windows", shell: "powershell", category: "network", risk: "safe",
      description: "Equivalente a netstat en PowerShell: conexiones TCP con estado y proceso propietario.",
      syntax: "Get-NetTCPConnection [-LocalPort] [-State] [-RemoteAddress]",
      flags: [
        { flag: "-State Listen", description: "Puertos en escucha." },
        { flag: "-LocalPort 443", description: "Filtra por puerto local." },
        { flag: "OwningProcess", description: "PID del proceso propietario." },
        { flag: "netstat -ano", description: "Alternativa clásica en CMD." }
      ],
      example: { command: "Get-NetTCPConnection -State Listen | Select-Object LocalAddress, LocalPort, @{n='Proceso';e={(Get-Process -Id $_.OwningProcess).ProcessName}} | Sort-Object LocalPort", explanation: "Inventario de puertos en escucha con el nombre del proceso que los abre." },
      tags: ["netstat", "puertos", "conexiones", "listen"]
    },
    {
      id: "win-resolve-dnsname", name: "Resolve-DnsName", os: "windows", shell: "powershell", category: "network", risk: "safe",
      description: "Consultas DNS desde PowerShell (sustituto moderno de nslookup).",
      syntax: "Resolve-DnsName -Name <string> [-Type A|MX|TXT|SRV] [-Server <ip>]",
      flags: [
        { flag: "-Type SRV", description: "Registros de servicio (AD)." },
        { flag: "-Server", description: "Servidor DNS concreto." },
        { flag: "-DnsOnly", description: "Ignora hosts/NetBIOS." },
        { flag: "nslookup", description: "Alternativa clásica." }
      ],
      example: { command: "Resolve-DnsName -Type SRV _ldap._tcp.dc._msdcs.corp.local", explanation: "Comprueba que el cliente encuentra los controladores de dominio vía DNS (problemas de unión al dominio)." },
      tags: ["dns", "nslookup", "srv", "resolver"]
    },
    {
      id: "win-pathping", name: "tracert / pathping", os: "windows", shell: "cmd", category: "network", risk: "safe",
      description: "Traza la ruta hasta un destino; pathping además mide la pérdida de paquetes en cada salto.",
      syntax: "tracert [-d] destino | pathping [-n] destino",
      flags: [
        { flag: "-d / -n", description: "No resuelve nombres (más rápido)." },
        { flag: "-h N", description: "Máximo de saltos." },
        { flag: "-q N (pathping)", description: "Consultas por salto." }
      ],
      example: { command: "pathping -n -q 50 vpn.empresa.com", explanation: "Identifica en qué salto hay pérdida de paquetes cuando la VPN va lenta." },
      tags: ["traceroute", "ruta", "latencia", "perdida"]
    },

    // ---- Netcat (Windows)
    {
      id: "win-ncat-scan", name: "ncat -zv (comprobar puertos)", os: "windows", shell: "cmd", category: "network", risk: "safe",
      description: "Ncat es el netcat moderno de Nmap para Windows (no viene instalado; se instala con Nmap o winget). Comprueba si un puerto TCP/UDP está abierto.",
      syntax: "ncat -zv [-u] [-w seg] host puerto",
      flags: [
        { flag: "-z", description: "Solo comprueba la conexión, sin enviar datos." },
        { flag: "-v", description: "Muestra el resultado de la conexión." },
        { flag: "-u", description: "Usa UDP." },
        { flag: "-w 3", description: "Tiempo de espera de conexión." },
        { flag: "winget install Insecure.Nmap", description: "Instala Nmap + Ncat." }
      ],
      example: { command: "for %p in (53 88 135 389 445 636 3268) do @ncat -zv -w 2 dc01.corp.local %p", explanation: "Verifica desde un cliente que los puertos de Active Directory (DNS, Kerberos, RPC, LDAP, SMB, GC) están abiertos hacia el controlador de dominio." },
      tags: ["netcat", "ncat", "nc", "puerto", "escaneo", "nmap"]
    },
    {
      id: "win-ncat-transfer", name: "ncat (transferir archivos)", os: "windows", shell: "cmd", category: "network", risk: "caution",
      description: "Envía archivos entre equipos Windows y/o Linux por TCP. Con --ssl el tráfico va cifrado.",
      syntax: "receptor: ncat -l puerto > archivo   |   emisor: ncat host puerto < archivo",
      flags: [
        { flag: "-l", description: "Escucha conexiones." },
        { flag: "--ssl", description: "Cifra la conexión con TLS (en ambos extremos)." },
        { flag: "--send-only / --recv-only", description: "Cierra limpiamente al terminar." },
        { flag: "--allow IP", description: "Solo acepta conexiones de esa IP." }
      ],
      example: { command: "REM Receptor (srv02):\nncat -l 9000 --ssl --recv-only --allow 10.0.0.11 > C:\\Temp\\backup.zip\nREM Emisor (srv01, 10.0.0.11):\nncat srv02 9000 --ssl --send-only < D:\\Backups\\backup.zip", explanation: "Copia un backup entre dos servidores sin carpetas compartidas, cifrado y aceptando solo al emisor esperado." },
      tags: ["netcat", "ncat", "transferir", "archivos", "ssl", "copiar"]
    },
    {
      id: "win-ncat-listen", name: "ncat -l (escucha de prueba)", os: "windows", shell: "cmd", category: "network", risk: "caution",
      description: "Abre un puerto en escucha temporal para validar reglas de firewall antes de instalar un servicio. Windows pedirá permitirlo en su firewall.",
      syntax: "ncat -lvk [-u] puerto",
      flags: [
        { flag: "-l", description: "Modo escucha." },
        { flag: "-k", description: "Acepta varias conexiones." },
        { flag: "-u", description: "Escucha UDP." },
        { flag: "--allow red/CIDR", description: "Restringe quién puede conectarse." }
      ],
      example: { command: "ncat -lvk 1433 --allow 10.20.0.0/24", explanation: "Simula el puerto de SQL Server en el servidor nuevo para que el equipo de redes valide las reglas desde la VLAN de aplicaciones." },
      tags: ["netcat", "ncat", "firewall", "listener", "puerto"]
    },
    {
      id: "win-ps-tcpclient", name: "System.Net.Sockets.TcpClient", os: "windows", shell: "powershell", category: "network", risk: "safe",
      description: "Alternativa nativa a netcat en PowerShell (sin instalar nada): comprueba puertos con tiempo de espera controlado o lanza un listener de prueba.",
      syntax: "(New-Object System.Net.Sockets.TcpClient).ConnectAsync(host, puerto).Wait(ms)",
      flags: [
        { flag: "ConnectAsync().Wait(ms)", description: "Devuelve True/False con timeout en milisegundos." },
        { flag: "[System.Net.Sockets.TcpListener]", description: "Abre un puerto en escucha de prueba." },
        { flag: "Test-NetConnection -Port", description: "Alternativa más lenta pero más detallada." }
      ],
      example: { command: "$hosts = 'web01','web02','web03'; foreach ($h in $hosts) { $c = New-Object System.Net.Sockets.TcpClient; [pscustomobject]@{Host=$h; Port443=$c.ConnectAsync($h,443).Wait(1000)}; $c.Close() }", explanation: "Comprobación rápida (1 s por equipo) del puerto 443 en varios servidores cuando ncat no está instalado y Test-NetConnection es demasiado lento." },
      tags: ["netcat", "nc", "puerto", "tcp", "powershell", "nativo"]
    },

    // ---- Procesos
    {
      id: "win-get-service", name: "Get-Service", os: "windows", shell: "powershell", category: "processes", risk: "safe",
      description: "Obtiene servicios de Windows con estado y tipo de inicio. Se combina con Start/Stop/Restart-Service.",
      syntax: "Get-Service [-Name <string[]>] [-ComputerName <string[]>] [-DependentServices]",
      flags: [
        { flag: "-Name *sql*", description: "Nombre con comodines." },
        { flag: "-DependentServices", description: "Servicios dependientes." },
        { flag: "| Restart-Service", description: "Reinicia los servicios obtenidos." },
        { flag: "| Where-Object", description: "Filtra por Status/StartType." }
      ],
      example: { command: "Get-Service | Where-Object { $_.StartType -eq 'Automatic' -and $_.Status -ne 'Running' } | Select-Object Name, DisplayName, Status", explanation: "Servicios automáticos que no están en ejecución: primera comprobación tras un reinicio problemático." },
      tags: ["servicios", "services", "estado", "arranque"]
    },
    {
      id: "win-get-process", name: "Get-Process", os: "windows", shell: "powershell", category: "processes", risk: "safe",
      description: "Lista procesos con CPU, memoria, handles y ruta del ejecutable.",
      syntax: "Get-Process [-Name] [-Id] [-IncludeUserName]",
      flags: [
        { flag: "-IncludeUserName", description: "Muestra el usuario (requiere elevación)." },
        { flag: "Sort-Object WS -Desc", description: "Ordena por memoria." },
        { flag: "-Module", description: "DLLs cargadas." }
      ],
      example: { command: "Get-Process | Sort-Object WS -Descending | Select-Object -First 10 Name, Id, @{n='RAM(MB)';e={[math]::Round($_.WS/1MB)}}, CPU", explanation: "Top 10 de procesos por memoria en un servidor RDS lento." },
      tags: ["procesos", "memoria", "cpu", "tasklist"]
    },
    {
      id: "win-taskkill", name: "taskkill / Stop-Process", os: "windows", shell: "cmd", category: "processes", risk: "danger",
      description: "Finaliza procesos por PID o nombre, local o remotamente. /F fuerza sin guardar.",
      syntax: "taskkill [/S equipo] /PID id | /IM imagen [/F] [/T]",
      flags: [
        { flag: "/IM nombre.exe", description: "Por nombre de imagen." },
        { flag: "/F", description: "Fuerza la terminación." },
        { flag: "/T", description: "Incluye procesos hijos." },
        { flag: "/FI \"STATUS eq NOT RESPONDING\"", description: "Filtro por estado." }
      ],
      example: { command: "taskkill /F /FI \"STATUS eq NOT RESPONDING\" /FI \"USERNAME eq CORP\\jlopez\"", explanation: "Cierra solo las aplicaciones colgadas de un usuario en un servidor de Terminal Server." },
      tags: ["matar", "kill", "proceso", "colgado", "cerrar"]
    },
    {
      id: "win-get-counter", name: "Get-Counter", os: "windows", shell: "powershell", category: "processes", risk: "safe",
      description: "Lee contadores de rendimiento (PerfMon): CPU, memoria, disco, red.",
      syntax: "Get-Counter -Counter <ruta[]> [-SampleInterval s] [-MaxSamples n] [-ComputerName]",
      flags: [
        { flag: "\\Processor(_Total)\\% Processor Time", description: "CPU total." },
        { flag: "\\Memory\\Available MBytes", description: "RAM libre." },
        { flag: "\\PhysicalDisk(*)\\Avg. Disk sec/Read", description: "Latencia de disco." },
        { flag: "-Continuous", description: "Muestreo continuo." }
      ],
      example: { command: "Get-Counter '\\Processor(_Total)\\% Processor Time','\\Memory\\Available MBytes','\\PhysicalDisk(_Total)\\Avg. Disk sec/Read' -SampleInterval 2 -MaxSamples 10", explanation: "Mide durante 20 s CPU, RAM libre y latencia de disco para diagnosticar un servidor lento." },
      tags: ["perfmon", "rendimiento", "cpu", "memoria", "disco"]
    },

    // ---- Seguridad
    {
      id: "win-get-winevent", name: "Get-WinEvent", os: "windows", shell: "powershell", category: "security", risk: "safe",
      description: "Consulta el Visor de eventos con filtros eficientes (FilterHashtable).",
      syntax: "Get-WinEvent -FilterHashtable @{LogName=...; Id=...; StartTime=...} [-MaxEvents n]",
      flags: [
        { flag: "Id=4625", description: "Inicio de sesión fallido." },
        { flag: "Id=4624 / 4740", description: "Inicio correcto / cuenta bloqueada." },
        { flag: "Id=1102", description: "Log de seguridad borrado (¡alerta!)." },
        { flag: "-ComputerName", description: "Consulta remota." }
      ],
      example: { command: "Get-WinEvent -FilterHashtable @{LogName='Security'; Id=4625; StartTime=(Get-Date).AddHours(-24)} | Group-Object { $_.Properties[19].Value } | Sort-Object Count -Descending | Select-Object -First 10 Count, Name", explanation: "Top 10 de IPs con inicios de sesión fallidos en las últimas 24 h (fuerza bruta contra RDP)." },
      tags: ["eventos", "logs", "auditoria", "4625", "seguridad"]
    },
    {
      id: "win-new-netfirewallrule", name: "New-NetFirewallRule", os: "windows", shell: "powershell", category: "security", risk: "caution",
      description: "Crea reglas en el Firewall de Windows Defender con PowerShell.",
      syntax: "New-NetFirewallRule -DisplayName <s> -Direction Inbound|Outbound -Protocol TCP -LocalPort <p> -Action Allow|Block",
      flags: [
        { flag: "-RemoteAddress", description: "Restringe por IP/red de origen." },
        { flag: "-Profile Domain", description: "Solo en perfil de dominio." },
        { flag: "Get-NetFirewallRule", description: "Lista reglas." },
        { flag: "Set-NetFirewallProfile -Enabled", description: "Activa/desactiva el firewall." }
      ],
      example: { command: "New-NetFirewallRule -DisplayName 'RDP - Solo Admin' -Direction Inbound -Protocol TCP -LocalPort 3389 -RemoteAddress 10.10.0.0/24 -Action Allow -Profile Domain", explanation: "Permite RDP solo desde la VLAN de administración en el perfil de dominio." },
      tags: ["firewall", "reglas", "puertos", "rdp", "bloquear"]
    },
    {
      id: "win-defender", name: "Get-MpComputerStatus", os: "windows", shell: "powershell", category: "security", risk: "safe",
      description: "Estado de Microsoft Defender: protección en tiempo real, firmas y último análisis.",
      syntax: "Get-MpComputerStatus | Update-MpSignature | Start-MpScan -ScanType",
      flags: [
        { flag: "Update-MpSignature", description: "Actualiza firmas." },
        { flag: "Start-MpScan -ScanType QuickScan", description: "Análisis rápido." },
        { flag: "Get-MpThreatDetection", description: "Amenazas detectadas." }
      ],
      example: { command: "Get-MpComputerStatus | Select-Object RealTimeProtectionEnabled, AntivirusSignatureLastUpdated, QuickScanEndTime", explanation: "Verificación rápida de cumplimiento del antivirus en un servidor." },
      tags: ["antivirus", "defender", "malware", "seguridad"]
    },
    {
      id: "win-auditpol", name: "auditpol", os: "windows", shell: "cmd", category: "security", risk: "caution",
      description: "Consulta y configura la directiva de auditoría avanzada de Windows.",
      syntax: "auditpol /get|/set /category:* | /subcategory:\"nombre\" [/success:enable] [/failure:enable]",
      flags: [
        { flag: "/get /category:*", description: "Muestra toda la directiva." },
        { flag: "/set /subcategory:", description: "Configura una subcategoría." },
        { flag: "/backup /restore", description: "Exporta e importa la directiva." }
      ],
      example: { command: "auditpol /set /subcategory:\"Logon\" /success:enable /failure:enable", explanation: "Activa la auditoría de inicios de sesión correctos y fallidos (eventos 4624/4625)." },
      tags: ["auditoria", "directiva", "eventos", "logon"]
    },

    // ---- Automatización
    {
      id: "win-schtasks", name: "schtasks", os: "windows", shell: "cmd", category: "automation", risk: "caution",
      description: "Crea, consulta y elimina tareas programadas desde CMD (local o remoto).",
      syntax: "schtasks /create|/query|/run|/delete /tn nombre [/tr comando] [/sc frecuencia] [/st hora] [/ru usuario]",
      flags: [
        { flag: "/sc DAILY|WEEKLY|ONSTART", description: "Frecuencia." },
        { flag: "/ru SYSTEM", description: "Ejecuta como SYSTEM." },
        { flag: "/rl HIGHEST", description: "Privilegios elevados." },
        { flag: "/query /fo LIST /v", description: "Detalle de tareas." }
      ],
      example: { command: "schtasks /create /tn \"Backup Nocturno\" /tr \"powershell -NoProfile -File C:\\Scripts\\backup.ps1\" /sc DAILY /st 02:30 /ru SYSTEM /rl HIGHEST", explanation: "Programa un script de backup diario a las 02:30 como SYSTEM." },
      tags: ["cron", "programar", "tareas", "planificador"]
    },
    {
      id: "win-register-scheduledtask", name: "Register-ScheduledTask", os: "windows", shell: "powershell", category: "automation", risk: "caution",
      description: "Crea tareas programadas con PowerShell usando acciones, desencadenadores y configuración.",
      syntax: "Register-ScheduledTask -TaskName <s> -Action <a> -Trigger <t> [-User] [-RunLevel Highest]",
      flags: [
        { flag: "New-ScheduledTaskAction", description: "Define el ejecutable/argumentos." },
        { flag: "New-ScheduledTaskTrigger -Daily -At", description: "Desencadenador." },
        { flag: "Get-ScheduledTaskInfo", description: "Último resultado y próxima ejecución." }
      ],
      example: { command: "$a = New-ScheduledTaskAction -Execute 'powershell.exe' -Argument '-NoProfile -File C:\\Scripts\\limpieza.ps1'; $t = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At 3am; Register-ScheduledTask -TaskName 'Limpieza Semanal' -Action $a -Trigger $t -User 'SYSTEM' -RunLevel Highest", explanation: "Tarea semanal de limpieza los domingos a las 03:00." },
      tags: ["cron", "programar", "tareas", "powershell"]
    },
    {
      id: "win-invoke-command", name: "Invoke-Command", os: "windows", shell: "powershell", category: "automation", risk: "caution",
      description: "Ejecuta bloques de script en uno o muchos equipos remotos en paralelo (WinRM/PowerShell Remoting).",
      syntax: "Invoke-Command -ComputerName <s[]> -ScriptBlock { ... } [-Credential] [-ThrottleLimit]",
      flags: [
        { flag: "-ComputerName (Get-Content lista.txt)", description: "Varios equipos." },
        { flag: "-ThrottleLimit 32", description: "Conexiones simultáneas." },
        { flag: "-ArgumentList", description: "Pasa parámetros al bloque." },
        { flag: "Enter-PSSession", description: "Sesión interactiva remota." }
      ],
      example: { command: "Invoke-Command -ComputerName (Get-Content .\\servidores.txt) -ScriptBlock { Get-HotFix | Sort-Object InstalledOn -Descending | Select-Object -First 1 } | Select-Object PSComputerName, HotFixID, InstalledOn", explanation: "Comprueba el último parche instalado en todos los servidores de una lista a la vez." },
      tags: ["remoto", "winrm", "masivo", "scripting", "ssh"]
    },

    // ---- Almacenamiento
    {
      id: "win-get-volume", name: "Get-Volume", os: "windows", shell: "powershell", category: "storage", risk: "safe",
      description: "Lista volúmenes con sistema de archivos, salud y espacio libre.",
      syntax: "Get-Volume [-DriveLetter] | Get-PSDrive -PSProvider FileSystem",
      flags: [
        { flag: "-DriveLetter C", description: "Un volumen concreto." },
        { flag: "HealthStatus", description: "Estado de salud." },
        { flag: "SizeRemaining", description: "Espacio libre en bytes." }
      ],
      example: { command: "Get-Volume | Where-Object DriveLetter | Select-Object DriveLetter, FileSystemLabel, @{n='Libre%';e={[math]::Round($_.SizeRemaining/$_.Size*100,1)}} | Sort-Object 'Libre%'", explanation: "Porcentaje libre por unidad, de menor a mayor, para alertas de espacio." },
      tags: ["espacio", "disco", "volumen", "libre"]
    },
    {
      id: "win-get-physicaldisk", name: "Get-PhysicalDisk", os: "windows", shell: "powershell", category: "storage", risk: "safe",
      description: "Información y estado de discos físicos (SSD/HDD, salud, contadores de fiabilidad).",
      syntax: "Get-PhysicalDisk | Get-StorageReliabilityCounter",
      flags: [
        { flag: "MediaType", description: "SSD, HDD o Unspecified." },
        { flag: "HealthStatus / OperationalStatus", description: "Salud del disco." },
        { flag: "Get-StorageReliabilityCounter", description: "Errores, temperatura, desgaste." }
      ],
      example: { command: "Get-PhysicalDisk | Get-StorageReliabilityCounter | Select-Object DeviceId, Temperature, Wear, ReadErrorsTotal, WriteErrorsTotal", explanation: "Detecta discos degradándose antes de que fallen (desgaste SSD y errores de lectura)." },
      tags: ["smart", "salud", "ssd", "disco", "fallo"]
    },
    {
      id: "win-chkdsk", name: "chkdsk", os: "windows", shell: "cmd", category: "storage", risk: "caution",
      description: "Comprueba y repara errores del sistema de archivos NTFS.",
      syntax: "chkdsk [unidad:] [/scan] [/f] [/r] [/spotfix]",
      flags: [
        { flag: "/scan", description: "Análisis en línea sin desmontar." },
        { flag: "/f", description: "Corrige errores (bloquea el volumen)." },
        { flag: "/r", description: "Busca sectores defectuosos (muy lento)." },
        { flag: "/spotfix", description: "Reparación rápida de errores detectados." }
      ],
      example: { command: "chkdsk D: /scan && chkdsk D: /spotfix", explanation: "Escanea en línea el volumen de datos y aplica solo las correcciones necesarias, minimizando el tiempo fuera de servicio." },
      tags: ["reparar", "ntfs", "errores", "disco"]
    },
    {
      id: "win-diskpart", name: "diskpart (clean)", os: "windows", shell: "cmd", category: "storage", risk: "danger",
      description: "Gestión de discos y particiones en modo interactivo. 'clean' borra toda la tabla de particiones del disco seleccionado.",
      syntax: "diskpart > list disk > select disk N > clean | create partition primary | format fs=ntfs quick",
      flags: [
        { flag: "list disk / list volume", description: "Inventario (seguro)." },
        { flag: "select disk N", description: "Selecciona el disco objetivo." },
        { flag: "clean", description: "¡BORRA todas las particiones!" },
        { flag: "extend", description: "Amplía el volumen seleccionado." }
      ],
      example: { command: "diskpart\nlist disk\nselect disk 2\ndetail disk\nclean\ncreate partition primary\nformat fs=ntfs label=Datos quick\nassign letter=E", explanation: "Prepara un disco nuevo. Usa 'detail disk' para confirmar que el disco 2 es el correcto ANTES de 'clean'." },
      tags: ["particiones", "formatear", "destructivo", "disco"]
    },
    {
      id: "win-format", name: "format / Format-Volume", os: "windows", shell: "powershell", category: "storage", risk: "danger",
      description: "Formatea un volumen eliminando todos sus datos.",
      syntax: "Format-Volume -DriveLetter X -FileSystem NTFS|ReFS [-NewFileSystemLabel] | format X: /FS:NTFS /Q",
      flags: [
        { flag: "-FileSystem NTFS|ReFS", description: "Sistema de archivos." },
        { flag: "-AllocationUnitSize 65536", description: "Cluster 64K (SQL, Hyper-V)." },
        { flag: "/Q", description: "Formato rápido (CMD)." }
      ],
      example: { command: "Format-Volume -DriveLetter F -FileSystem NTFS -AllocationUnitSize 65536 -NewFileSystemLabel 'SQLData' -Confirm", explanation: "Formatea el disco de datos de SQL Server con clúster de 64K recomendado. -Confirm obliga a confirmar." },
      tags: ["formatear", "destructivo", "volumen", "ntfs"]
    },

    // ---- Active Directory
    {
      id: "win-get-aduser", name: "Get-ADUser", os: "windows", shell: "powershell", category: "ad", risk: "safe",
      description: "Consulta usuarios de Active Directory con filtros y propiedades extendidas.",
      syntax: "Get-ADUser -Identity <u> | -Filter <f> [-Properties *] [-SearchBase <OU>]",
      flags: [
        { flag: "-Properties *", description: "Todas las propiedades." },
        { flag: "-Filter {Enabled -eq $true}", description: "Filtro PowerShell." },
        { flag: "-SearchBase \"OU=...\"", description: "Limita a una OU." },
        { flag: "-LDAPFilter", description: "Filtro LDAP nativo." }
      ],
      example: { command: "Get-ADUser -Filter {Enabled -eq $true} -Properties LastLogonDate | Where-Object { $_.LastLogonDate -lt (Get-Date).AddDays(-90) } | Select-Object SamAccountName, LastLogonDate | Export-Csv inactivos.csv -NoTypeInformation", explanation: "Exporta las cuentas activas que no inician sesión en 90 días para la revisión trimestral." },
      tags: ["usuarios", "ad", "dominio", "ldap", "inactivos"]
    },
    {
      id: "win-new-aduser", name: "New-ADUser", os: "windows", shell: "powershell", category: "ad", risk: "caution",
      description: "Crea cuentas de usuario en AD; ideal para altas masivas desde CSV.",
      syntax: "New-ADUser -Name <s> -SamAccountName <s> -UserPrincipalName <s> -Path <OU> -AccountPassword <SecureString> -Enabled $true",
      flags: [
        { flag: "-Path \"OU=...\"", description: "OU de destino." },
        { flag: "-ChangePasswordAtLogon $true", description: "Fuerza cambio en el primer inicio." },
        { flag: "Import-Csv | ForEach-Object", description: "Alta masiva." }
      ],
      example: { command: "Import-Csv altas.csv | ForEach-Object { New-ADUser -Name \"$($_.Nombre) $($_.Apellido)\" -SamAccountName $_.Usuario -UserPrincipalName \"$($_.Usuario)@corp.local\" -Path 'OU=Usuarios,OU=Madrid,DC=corp,DC=local' -AccountPassword (ConvertTo-SecureString $_.PassTemp -AsPlainText -Force) -ChangePasswordAtLogon $true -Enabled $true }", explanation: "Alta masiva de nuevas incorporaciones desde un CSV, forzando cambio de contraseña." },
      tags: ["alta", "crear", "usuarios", "csv", "masivo"]
    },
    {
      id: "win-unlock-adaccount", name: "Unlock-ADAccount", os: "windows", shell: "powershell", category: "ad", risk: "caution",
      description: "Desbloquea cuentas bloqueadas; con Search-ADAccount localiza todas las bloqueadas.",
      syntax: "Unlock-ADAccount -Identity <u> | Search-ADAccount -LockedOut",
      flags: [
        { flag: "Search-ADAccount -LockedOut", description: "Cuentas bloqueadas." },
        { flag: "-AccountInactive -TimeSpan 90", description: "Cuentas inactivas." },
        { flag: "-PasswordExpired", description: "Contraseñas caducadas." }
      ],
      example: { command: "Search-ADAccount -LockedOut | Select-Object SamAccountName, LastLogonDate; Unlock-ADAccount -Identity jlopez", explanation: "Ticket típico de helpdesk: lista los bloqueados y desbloquea al usuario que llama." },
      tags: ["bloqueo", "desbloquear", "lockout", "helpdesk"]
    },
    {
      id: "win-set-adaccountpassword", name: "Set-ADAccountPassword", os: "windows", shell: "powershell", category: "ad", risk: "caution",
      description: "Restablece la contraseña de un usuario de AD.",
      syntax: "Set-ADAccountPassword -Identity <u> -Reset -NewPassword <SecureString>",
      flags: [
        { flag: "-Reset", description: "Restablece sin la contraseña anterior." },
        { flag: "Set-ADUser -ChangePasswordAtLogon $true", description: "Obliga a cambiarla." }
      ],
      example: { command: "Set-ADAccountPassword -Identity jlopez -Reset -NewPassword (Read-Host -AsSecureString 'Nueva contraseña'); Set-ADUser jlopez -ChangePasswordAtLogon $true", explanation: "Reseteo seguro: la contraseña no queda en el historial de la consola y el usuario debe cambiarla." },
      tags: ["contraseña", "password", "reset", "helpdesk"]
    },
    {
      id: "win-adgroupmember", name: "Add-ADGroupMember", os: "windows", shell: "powershell", category: "ad", risk: "caution",
      description: "Gestiona la pertenencia a grupos de seguridad (añadir, listar, quitar).",
      syntax: "Add-ADGroupMember -Identity <grupo> -Members <u[]> | Get-ADGroupMember -Recursive",
      flags: [
        { flag: "Get-ADGroupMember -Recursive", description: "Miembros incluyendo grupos anidados." },
        { flag: "Remove-ADGroupMember", description: "Quita miembros." },
        { flag: "Get-ADPrincipalGroupMembership", description: "Grupos de un usuario." }
      ],
      example: { command: "Get-ADGroupMember 'Domain Admins' -Recursive | Select-Object Name, SamAccountName, objectClass", explanation: "Auditoría de quién tiene realmente privilegios de Domain Admins, contando grupos anidados." },
      tags: ["grupos", "seguridad", "miembros", "domain admins"]
    },
    {
      id: "win-dcdiag", name: "dcdiag / repadmin", os: "windows", shell: "cmd", category: "ad", risk: "safe",
      description: "Diagnóstico de controladores de dominio y estado de la replicación de AD.",
      syntax: "dcdiag [/s:DC] [/v] [/test:prueba] | repadmin /replsummary | /showrepl",
      flags: [
        { flag: "dcdiag /e /q", description: "Todos los DC, solo errores." },
        { flag: "dcdiag /test:dns", description: "Pruebas DNS." },
        { flag: "repadmin /replsummary", description: "Resumen de replicación." },
        { flag: "repadmin /syncall /AdeP", description: "Fuerza replicación (precaución)." }
      ],
      example: { command: "repadmin /replsummary && dcdiag /e /q", explanation: "Health-check semanal del bosque: errores de replicación y fallos de cualquier DC." },
      tags: ["dc", "replicacion", "salud", "diagnostico", "dns"]
    },
    {
      id: "win-gpupdate", name: "gpupdate / gpresult", os: "windows", shell: "cmd", category: "ad", risk: "safe",
      description: "Aplica directivas de grupo y muestra el resultado de las GPO aplicadas (RSoP).",
      syntax: "gpupdate [/force] [/target:user|computer] | gpresult /r | /h informe.html",
      flags: [
        { flag: "gpupdate /force", description: "Reaplica todas las directivas." },
        { flag: "gpresult /r", description: "Resumen de GPO aplicadas." },
        { flag: "gpresult /h f.html", description: "Informe HTML detallado." },
        { flag: "Invoke-GPUpdate -Computer", description: "Forzar en remoto (PowerShell)." }
      ],
      example: { command: "gpupdate /force && gpresult /h C:\\Temp\\gpo.html /f", explanation: "Una GPO no se aplica: fuerza la actualización y genera un informe para ver si se filtró o falló." },
      tags: ["gpo", "directivas", "politicas", "rsop"]
    },
    {
      id: "win-ldapsearch", name: "dsquery / Get-ADObject -LDAPFilter", os: "windows", shell: "powershell", category: "ad", risk: "safe",
      description: "Búsquedas LDAP directas contra el directorio con filtros nativos.",
      syntax: "Get-ADObject -LDAPFilter \"(filtro)\" [-SearchBase] [-Properties]",
      flags: [
        { flag: "(objectClass=computer)", description: "Equipos." },
        { flag: "(userAccountControl:1.2.840.113556.1.4.803:=2)", description: "Cuentas deshabilitadas (bit a bit)." },
        { flag: "dsquery * -filter", description: "Alternativa CMD." }
      ],
      example: { command: "Get-ADObject -LDAPFilter '(&(objectCategory=person)(objectClass=user)(userAccountControl:1.2.840.113556.1.4.803:=65536))' -Properties userAccountControl | Select-Object Name", explanation: "Lista usuarios con 'La contraseña nunca expira' activado, hallazgo frecuente en auditorías." },
      tags: ["ldap", "filtro", "busqueda", "directorio"]
    },

    /* ===================== AMPLIACIÓN · LINUX ===================== */

    // ---- Usuarios y permisos
    {
      id: "linux-id", name: "id / groups / who", os: "linux", shell: "bash", category: "users", risk: "safe",
      description: "Muestra UID, GID y grupos de un usuario, y quién tiene sesión abierta en el sistema.",
      syntax: "id [usuario] | groups [usuario] | who | w",
      flags: [
        { flag: "id -nG usuario", description: "Solo los nombres de sus grupos." },
        { flag: "w", description: "Usuarios conectados, desde dónde y qué ejecutan." },
        { flag: "getent passwd usuario", description: "Datos de la cuenta (también LDAP/SSSD)." }
      ],
      example: { command: "id aruiz && getent group sudo docker && w", explanation: "Comprueba si un usuario pertenece a los grupos esperados y quién está conectado ahora mismo al servidor." },
      tags: ["usuario", "grupos", "uid", "sesiones", "quien"]
    },
    {
      id: "linux-chage", name: "chage", os: "linux", shell: "bash", category: "users", risk: "caution",
      description: "Consulta y configura la caducidad de contraseñas y cuentas.",
      syntax: "chage [-l] [-M días] [-d 0] [-E fecha] usuario",
      flags: [
        { flag: "-l", description: "Muestra la política actual del usuario." },
        { flag: "-M 90", description: "Días máximos de validez de la contraseña." },
        { flag: "-d 0", description: "Obliga a cambiar la contraseña en el próximo inicio." },
        { flag: "-E 2026-12-31", description: "Fecha de caducidad de la cuenta." }
      ],
      example: { command: "chage -d 0 -M 90 -W 7 aruiz && chage -l aruiz", explanation: "Fuerza el cambio de contraseña inicial y aplica la política de 90 días con aviso 7 días antes." },
      tags: ["contraseña", "caducidad", "password", "politica"]
    },
    {
      id: "linux-setfacl", name: "getfacl / setfacl", os: "linux", shell: "bash", category: "users", risk: "caution",
      description: "Gestiona ACL POSIX: permisos para usuarios o grupos concretos más allá de propietario/grupo/otros.",
      syntax: "setfacl [-R] [-d] -m u:usuario:rwx|g:grupo:rx ruta | getfacl ruta",
      flags: [
        { flag: "-m", description: "Añade o modifica una entrada." },
        { flag: "-x", description: "Elimina una entrada." },
        { flag: "-d", description: "ACL por defecto (heredada por lo nuevo)." },
        { flag: "-R", description: "Recursivo." }
      ],
      example: { command: "setfacl -R -m g:auditores:rX /srv/finanzas && setfacl -R -d -m g:auditores:rX /srv/finanzas && getfacl /srv/finanzas", explanation: "Da lectura al grupo de auditores en una carpeta, también sobre los archivos que se creen en el futuro, sin cambiar propietarios." },
      tags: ["acl", "permisos", "grupo", "acceso"]
    },

    // ---- Archivos
    {
      id: "linux-sed", name: "sed", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Editor de flujo: busca y reemplaza texto en archivos o en la salida de comandos. Con -i modifica el archivo.",
      syntax: "sed [-i[.bak]] [-E] 's/buscar/reemplazar/g' archivo",
      flags: [
        { flag: "-i.bak", description: "Edita en el sitio guardando copia .bak." },
        { flag: "-n '10,20p'", description: "Imprime solo un rango de líneas." },
        { flag: "'/patrón/d'", description: "Borra las líneas que coinciden." },
        { flag: "-E", description: "Expresiones regulares extendidas." }
      ],
      example: { command: "sed -i.bak -E 's/^#?PermitRootLogin.*/PermitRootLogin no/' /etc/ssh/sshd_config && sshd -t", explanation: "Desactiva el login de root por SSH dejando copia de seguridad y valida la sintaxis antes de recargar." },
      tags: ["reemplazar", "editar", "texto", "regex", "buscar"]
    },
    {
      id: "linux-awk", name: "awk", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Procesa texto por columnas: filtra, suma y formatea salidas de comandos y logs.",
      syntax: "awk [-F sep] 'patrón { acción }' archivo",
      flags: [
        { flag: "-F:", description: "Separador de campos (por defecto espacios)." },
        { flag: "$1, $NF", description: "Primera / última columna." },
        { flag: "NR > 1", description: "Salta la cabecera." },
        { flag: "END { }", description: "Acción al final (totales)." }
      ],
      example: { command: "awk '{print $1}' /var/log/nginx/access.log | sort | uniq -c | sort -nr | head -n 10", explanation: "Las 10 IPs que más peticiones hacen al servidor web: útil ante picos de tráfico o scraping." },
      tags: ["columnas", "texto", "procesar", "logs", "sumar"]
    },
    {
      id: "linux-chattr", name: "chattr / lsattr", os: "linux", shell: "bash", category: "security", risk: "caution",
      description: "Atributos especiales del sistema de archivos: +i hace un archivo inmutable (ni root puede borrarlo sin quitarlo).",
      syntax: "chattr [+|-][i|a] archivo | lsattr archivo",
      flags: [
        { flag: "+i", description: "Inmutable: no se puede modificar, borrar ni renombrar." },
        { flag: "+a", description: "Solo añadir (ideal para logs)." },
        { flag: "-i", description: "Quita la inmutabilidad." },
        { flag: "lsattr", description: "Muestra los atributos." }
      ],
      example: { command: "chattr +i /etc/resolv.conf && lsattr /etc/resolv.conf", explanation: "Impide que NetworkManager o DHCP sobrescriban los DNS configurados a mano. Recuerda quitarlo (-i) para editarlo." },
      tags: ["inmutable", "proteger", "atributos", "archivo"]
    },

    // ---- Redes
    {
      id: "linux-ssh", name: "ssh", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Acceso remoto seguro, ejecución de comandos y túneles (port forwarding) a través de servidores bastión.",
      syntax: "ssh [-p puerto] [-i clave] [-J bastión] [-L|-R local:host:remoto] usuario@host [comando]",
      flags: [
        { flag: "-J bastion", description: "Salta a través de un servidor bastión (ProxyJump)." },
        { flag: "-L 8080:host:80", description: "Túnel local: tu puerto 8080 llega al 80 remoto." },
        { flag: "-N -f", description: "Sin shell y en segundo plano (solo túnel)." },
        { flag: "-v", description: "Depuración de la conexión/autenticación." }
      ],
      example: { command: "ssh -N -f -J admin@bastion.corp.com -L 15432:db01.internal:5432 admin@app01.internal", explanation: "Accede desde tu equipo a una base de datos interna (localhost:15432) pasando por el bastión, sin abrir puertos en el firewall." },
      tags: ["remoto", "tunel", "bastion", "acceso", "port forwarding"]
    },
    {
      id: "linux-ssh-keygen", name: "ssh-keygen / ssh-copy-id", os: "linux", shell: "bash", category: "security", risk: "safe",
      description: "Genera pares de claves SSH y las instala en servidores para acceder sin contraseña.",
      syntax: "ssh-keygen -t ed25519 [-C comentario] [-f archivo] | ssh-copy-id [-i clave.pub] usuario@host",
      flags: [
        { flag: "-t ed25519", description: "Algoritmo moderno recomendado." },
        { flag: "-C 'texto'", description: "Comentario identificativo." },
        { flag: "-R host", description: "Borra un host de known_hosts (tras reinstalar un servidor)." },
        { flag: "-lf clave.pub", description: "Muestra la huella de una clave." }
      ],
      example: { command: "ssh-keygen -t ed25519 -C \"admin@$(hostname)-$(date +%Y)\" && ssh-copy-id -i ~/.ssh/id_ed25519.pub admin@srv01", explanation: "Crea una clave Ed25519 con comentario identificable y la instala en el servidor para dejar de usar contraseñas." },
      tags: ["claves", "ssh", "autenticacion", "llave", "known_hosts"]
    },
    {
      id: "linux-scp", name: "scp / sftp", os: "linux", shell: "bash", category: "network", risk: "caution",
      description: "Copia archivos entre equipos a través de SSH. scp sobrescribe el destino sin preguntar.",
      syntax: "scp [-r] [-P puerto] [-J bastión] origen usuario@host:destino",
      flags: [
        { flag: "-r", description: "Copia directorios." },
        { flag: "-P 2222", description: "Puerto SSH (mayúscula, a diferencia de ssh)." },
        { flag: "-p", description: "Conserva fechas y permisos." },
        { flag: "-J bastion", description: "A través de un bastión." }
      ],
      example: { command: "scp -p -J admin@bastion admin@app01:/var/log/app/error.log ./app01-error-$(date +%F).log", explanation: "Descarga un log de un servidor interno a tu equipo pasando por el bastión, para adjuntarlo a una incidencia." },
      tags: ["copiar", "remoto", "ssh", "transferir", "descargar"]
    },
    {
      id: "linux-nmap", name: "nmap", os: "linux", shell: "bash", category: "network", risk: "caution",
      description: "Escáner de red: descubre equipos, puertos abiertos, servicios y versiones. Úsalo solo en redes que administras.",
      syntax: "nmap [-sn|-sS|-sV] [-p puertos] [-O] objetivo",
      flags: [
        { flag: "-sn", description: "Solo descubre equipos vivos (sin escanear puertos)." },
        { flag: "-sV", description: "Detecta servicio y versión." },
        { flag: "-p- / -p 22,80,443", description: "Todos los puertos / lista concreta." },
        { flag: "-oN archivo", description: "Guarda el resultado." }
      ],
      example: { command: "nmap -sn 192.168.10.0/24 -oG - | awk '/Up$/{print $2}'", explanation: "Inventario rápido de las IPs en uso en la VLAN antes de asignar una IP estática nueva." },
      tags: ["escaneo", "puertos", "descubrimiento", "inventario", "auditoria"]
    },
    {
      id: "linux-mtr", name: "mtr / traceroute", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Combina ping y traceroute: muestra latencia y pérdida de paquetes en cada salto de forma continua.",
      syntax: "mtr [-r] [-c N] [-n] [-T -P puerto] destino",
      flags: [
        { flag: "-r -c 100", description: "Modo informe con 100 ciclos (para tickets)." },
        { flag: "-n", description: "Sin resolver nombres." },
        { flag: "-T -P 443", description: "Usa TCP al puerto 443 (atraviesa firewalls que bloquean ICMP)." }
      ],
      example: { command: "mtr -rwn -c 100 -T -P 443 api.proveedor.com", explanation: "Informe de pérdida por salto hacia la API de un proveedor para demostrarle dónde está el problema." },
      tags: ["traceroute", "latencia", "perdida", "ping", "ruta"]
    },
    {
      id: "linux-nmcli", name: "nmcli", os: "linux", shell: "bash", category: "network", risk: "caution",
      description: "Configura la red con NetworkManager (RHEL, Fedora, Ubuntu Desktop): IPs, DNS, Wi-Fi y conexiones persistentes.",
      syntax: "nmcli [device|connection] [show|modify|up|down] [nombre] [parámetros]",
      flags: [
        { flag: "device status", description: "Estado de las interfaces." },
        { flag: "con mod X ipv4.addresses", description: "IP estática persistente." },
        { flag: "ipv4.method manual", description: "Desactiva DHCP." },
        { flag: "con up X", description: "Aplica los cambios." }
      ],
      example: { command: "nmcli con mod ens192 ipv4.method manual ipv4.addresses 10.0.0.20/24 ipv4.gateway 10.0.0.1 ipv4.dns '10.0.0.10 10.0.0.11' && nmcli con up ens192", explanation: "Configura IP estática persistente en un servidor RHEL. Si estás por SSH en esa interfaz, perderás la sesión si te equivocas." },
      tags: ["red", "ip", "estatica", "networkmanager", "dns"]
    },

    // ---- Procesos
    {
      id: "linux-lsof", name: "lsof", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Lista archivos abiertos por procesos: qué proceso usa un puerto, un archivo o un disco que no se puede desmontar.",
      syntax: "lsof [-i :puerto] [-p PID] [+D dir] [archivo]",
      flags: [
        { flag: "-i :443", description: "Procesos usando el puerto 443." },
        { flag: "+L1", description: "Archivos borrados que siguen ocupando espacio." },
        { flag: "+D /mnt/datos", description: "Procesos con archivos abiertos en un directorio." },
        { flag: "-u usuario", description: "Archivos abiertos por un usuario." }
      ],
      example: { command: "lsof +L1 | awk 'NR==1 || $7 > 100000000'", explanation: "df dice que el disco está lleno pero du no encuentra nada: localiza archivos borrados (>100 MB) aún abiertos por un proceso." },
      tags: ["archivos abiertos", "puerto", "desmontar", "busy", "espacio"]
    },
    {
      id: "linux-dmesg", name: "dmesg", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Mensajes del kernel: errores de hardware, discos, memoria (OOM killer) y drivers.",
      syntax: "dmesg [-T] [-l nivel] [-w]",
      flags: [
        { flag: "-T", description: "Fechas legibles." },
        { flag: "-l err,warn", description: "Solo errores y avisos." },
        { flag: "-w", description: "Sigue en tiempo real." },
        { flag: "journalctl -k", description: "Equivalente desde journald." }
      ],
      example: { command: "dmesg -T | grep -Ei 'out of memory|killed process|I/O error|ata[0-9].*error'", explanation: "Averigua si un proceso murió por falta de memoria (OOM killer) o si hay errores de disco." },
      tags: ["kernel", "hardware", "oom", "errores", "disco"]
    },
    {
      id: "linux-uptime", name: "uptime / hostnamectl", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Tiempo encendido, carga media y datos del sistema (SO, kernel, virtualización).",
      syntax: "uptime [-p] | hostnamectl [set-hostname nombre] | uname -a",
      flags: [
        { flag: "uptime -p", description: "Tiempo encendido legible." },
        { flag: "load average", description: "Carga a 1, 5 y 15 min; compárala con el nº de CPUs (nproc)." },
        { flag: "hostnamectl set-hostname", description: "Cambia el nombre del equipo." },
        { flag: "cat /etc/os-release", description: "Distribución y versión." }
      ],
      example: { command: "uptime && nproc && hostnamectl && cat /etc/os-release | head -n 3", explanation: "Ficha rápida de un servidor al conectarte por primera vez: carga, CPUs, SO, kernel y si es VM." },
      tags: ["carga", "sistema", "informacion", "kernel", "hostname"]
    },
    {
      id: "linux-renice", name: "nice / renice / ionice", os: "linux", shell: "bash", category: "processes", risk: "caution",
      description: "Cambia la prioridad de CPU y de disco de un proceso para que no afecte al resto.",
      syntax: "nice -n N comando | renice -n N -p PID | ionice -c 3 -p PID",
      flags: [
        { flag: "-n 19", description: "Prioridad mínima (de -20 a 19)." },
        { flag: "renice -p PID", description: "Cambia un proceso en ejecución." },
        { flag: "ionice -c 3", description: "Disco solo cuando nadie más lo usa (idle)." }
      ],
      example: { command: "nice -n 19 ionice -c 3 tar -czf /backups/home.tar.gz /home", explanation: "Ejecuta un backup pesado en horario laboral sin ralentizar las aplicaciones del servidor." },
      tags: ["prioridad", "cpu", "rendimiento", "io"]
    },

    // ---- Seguridad
    {
      id: "linux-openssl", name: "openssl", os: "linux", shell: "bash", category: "security", risk: "safe",
      description: "Navaja suiza de TLS: inspecciona certificados remotos, comprueba caducidades y genera claves y CSR.",
      syntax: "openssl s_client -connect host:443 | openssl x509 -noout -dates | openssl req -new ...",
      flags: [
        { flag: "s_client -servername", description: "Conecta indicando SNI." },
        { flag: "x509 -noout -dates -subject", description: "Fechas y titular del certificado." },
        { flag: "req -new -newkey rsa:2048 -nodes", description: "Genera clave + CSR." },
        { flag: "pkcs12 -export", description: "Convierte a .pfx para Windows/IIS." }
      ],
      example: { command: "echo | openssl s_client -connect web.empresa.com:443 -servername web.empresa.com 2>/dev/null | openssl x509 -noout -subject -issuer -enddate", explanation: "Comprueba qué certificado sirve realmente la web y cuándo caduca, sin abrir el navegador." },
      tags: ["certificado", "tls", "ssl", "caducidad", "csr"]
    },
    {
      id: "linux-fail2ban", name: "fail2ban-client", os: "linux", shell: "bash", category: "security", risk: "caution",
      description: "Gestiona Fail2ban: consulta y libera IPs bloqueadas por intentos fallidos.",
      syntax: "fail2ban-client status [jail] | set jail unbanip|banip IP",
      flags: [
        { flag: "status", description: "Lista las jails activas." },
        { flag: "status sshd", description: "IPs bloqueadas en la jail de SSH." },
        { flag: "set sshd unbanip IP", description: "Desbloquea una IP." },
        { flag: "set sshd banip IP", description: "Bloquea una IP manualmente." }
      ],
      example: { command: "fail2ban-client status sshd && fail2ban-client set sshd unbanip 203.0.113.45", explanation: "Un compañero se ha bloqueado por fallar la contraseña: revisa la jail de SSH y libera su IP." },
      tags: ["bloqueo", "ban", "fuerza bruta", "ssh", "ip"]
    },
    {
      id: "linux-ausearch", name: "ausearch / aureport", os: "linux", shell: "bash", category: "security", risk: "safe",
      description: "Consulta los registros de auditd: quién accedió o modificó archivos vigilados, comandos ejecutados con sudo, etc.",
      syntax: "ausearch [-k clave] [-ts inicio] [-i] | aureport [--auth|--login|--failed]",
      flags: [
        { flag: "-k clave", description: "Eventos de una regla con esa clave." },
        { flag: "-ts today", description: "Desde hoy (o fecha/hora)." },
        { flag: "-i", description: "Interpreta UIDs y syscalls a nombres." },
        { flag: "auditctl -w ruta -p wa -k clave", description: "Crea una regla de vigilancia." }
      ],
      example: { command: "auditctl -w /etc/sudoers -p wa -k sudoers_cambios && ausearch -k sudoers_cambios -ts today -i", explanation: "Vigila cambios en /etc/sudoers y muestra quién lo modificó hoy." },
      tags: ["auditoria", "auditd", "vigilar", "cambios", "forense"]
    },

    // ---- Automatización
    {
      id: "linux-watch", name: "watch", os: "linux", shell: "bash", category: "automation", risk: "safe",
      description: "Ejecuta un comando cada N segundos y muestra su salida a pantalla completa, resaltando los cambios.",
      syntax: "watch [-n seg] [-d] 'comando'",
      flags: [
        { flag: "-n 2", description: "Intervalo en segundos." },
        { flag: "-d", description: "Resalta lo que cambia entre ejecuciones." },
        { flag: "-g", description: "Sale cuando la salida cambia." }
      ],
      example: { command: "watch -n 5 -d 'df -h /data; ls -lh /data/backup | tail -n 3'", explanation: "Vigila el espacio libre y el crecimiento del backup en curso sin tener que relanzar los comandos." },
      tags: ["repetir", "monitorizar", "intervalo", "vigilar"]
    },
    {
      id: "linux-tmux", name: "tmux / screen", os: "linux", shell: "bash", category: "automation", risk: "safe",
      description: "Sesiones de terminal persistentes: el proceso sigue vivo aunque se corte la conexión SSH.",
      syntax: "tmux new -s nombre | tmux attach -t nombre | tmux ls",
      flags: [
        { flag: "new -s nombre", description: "Crea una sesión con nombre." },
        { flag: "Ctrl+b d", description: "Se desconecta dejando la sesión viva." },
        { flag: "attach -t nombre", description: "Vuelve a conectarse." },
        { flag: "Ctrl+b %  /  \"", description: "Divide la ventana en paneles." }
      ],
      example: { command: "tmux new -s upgrade 'apt update && apt full-upgrade -y; bash'", explanation: "Lanza una actualización larga dentro de tmux: si se cae la VPN, vuelves con 'tmux attach -t upgrade' y sigue ahí." },
      tags: ["sesion", "persistente", "ssh", "terminal", "nohup"]
    },
    {
      id: "linux-at", name: "at", os: "linux", shell: "bash", category: "automation", risk: "caution",
      description: "Programa un comando para ejecutarse UNA sola vez en un momento concreto.",
      syntax: "echo 'comando' | at HH:MM [fecha] | atq | atrm N",
      flags: [
        { flag: "at now + 10 minutes", description: "Dentro de 10 minutos." },
        { flag: "at 23:00 tomorrow", description: "Mañana a las 23:00." },
        { flag: "atq / atrm N", description: "Lista / cancela trabajos." }
      ],
      example: { command: "echo 'cp /etc/iptables/rules.v4.bak /etc/iptables/rules.v4 && iptables-restore < /etc/iptables/rules.v4' | at now + 10 minutes", explanation: "Red de seguridad antes de tocar el firewall en remoto: si te quedas fuera, las reglas antiguas se restauran solas. Cancélalo con atrm si todo va bien." },
      tags: ["programar", "una vez", "tarea", "rollback"]
    },

    // ---- Almacenamiento
    {
      id: "linux-smartctl", name: "smartctl", os: "linux", shell: "bash", category: "storage", risk: "safe",
      description: "Lee el estado S.M.A.R.T. de discos HDD/SSD/NVMe para anticipar fallos.",
      syntax: "smartctl [-H] [-a] [-t short|long] /dev/sdX",
      flags: [
        { flag: "-H", description: "Veredicto de salud (PASSED/FAILED)." },
        { flag: "-a", description: "Todos los atributos." },
        { flag: "-t short", description: "Lanza un autotest corto." },
        { flag: "-d megaraid,N", description: "Discos detrás de una controladora RAID." }
      ],
      example: { command: "smartctl -H -A /dev/sda | grep -Ei 'result|Reallocated|Pending|Uncorrectable|Wear'", explanation: "Revisa sectores reasignados y pendientes: si crecen, cambia el disco antes de que falle." },
      tags: ["smart", "salud", "disco", "ssd", "fallo"]
    },
    {
      id: "linux-ncdu", name: "ncdu", os: "linux", shell: "bash", category: "storage", risk: "caution",
      description: "Analizador de espacio interactivo: navega por directorios ordenados por tamaño y borra desde la propia interfaz.",
      syntax: "ncdu [-x] [ruta]",
      flags: [
        { flag: "-x", description: "No cruza a otros sistemas de archivos." },
        { flag: "d (tecla)", description: "Borra el elemento seleccionado (¡cuidado!)." },
        { flag: "-o archivo", description: "Exporta el análisis para verlo después." }
      ],
      example: { command: "ncdu -x /var", explanation: "Encuentra visualmente qué está llenando /var (logs, cachés de paquetes, imágenes de Docker…)." },
      tags: ["espacio", "disco", "tamaño", "lleno", "interactivo"]
    },
    {
      id: "linux-swap", name: "mkswap / swapon", os: "linux", shell: "bash", category: "storage", risk: "caution",
      description: "Crea y activa espacio de intercambio (swap) en un archivo o partición.",
      syntax: "fallocate -l 4G /swapfile && mkswap /swapfile && swapon /swapfile",
      flags: [
        { flag: "swapon --show", description: "Swap activa." },
        { flag: "swapoff -a", description: "Desactiva toda la swap." },
        { flag: "vm.swappiness", description: "Tendencia del kernel a usar swap (sysctl)." }
      ],
      example: { command: "fallocate -l 4G /swapfile && chmod 600 /swapfile && mkswap /swapfile && swapon /swapfile && echo '/swapfile none swap sw 0 0' >> /etc/fstab", explanation: "Añade 4 GB de swap persistente a una VM pequeña que sufre cierres por falta de memoria." },
      tags: ["swap", "memoria", "intercambio", "ram"]
    },
    {
      id: "linux-fsck", name: "fsck", os: "linux", shell: "bash", category: "storage", risk: "danger",
      description: "Comprueba y repara sistemas de archivos. Ejecutarlo sobre un volumen montado puede corromperlo.",
      syntax: "fsck [-n] [-y] /dev/sdXN",
      flags: [
        { flag: "-n", description: "Solo comprueba, no cambia nada." },
        { flag: "-y", description: "Responde Sí a todas las reparaciones." },
        { flag: "-f", description: "Fuerza la comprobación aunque parezca limpio." },
        { flag: "xfs_repair", description: "Equivalente para XFS." }
      ],
      example: { command: "umount /data && fsck -n /dev/sdb1 && fsck -y /dev/sdb1 && mount /data", explanation: "Repara el volumen de datos tras un apagado brusco: desmonta, revisa en modo lectura y después repara." },
      tags: ["reparar", "sistema de archivos", "corrupcion", "disco"]
    },

    // ---- Paquetes
    {
      id: "linux-apt", name: "apt", os: "linux", shell: "bash", category: "packages", risk: "caution",
      description: "Gestor de paquetes de Debian/Ubuntu: instalar, actualizar, buscar y eliminar software.",
      syntax: "apt update | apt install|remove|purge paquete | apt upgrade | apt list --upgradable",
      flags: [
        { flag: "update", description: "Actualiza la lista de paquetes." },
        { flag: "list --upgradable", description: "Qué se actualizaría." },
        { flag: "full-upgrade", description: "Actualiza incluso cambiando dependencias." },
        { flag: "apt-mark hold paquete", description: "Congela la versión de un paquete." },
        { flag: "autoremove --purge", description: "Elimina dependencias huérfanas." }
      ],
      example: { command: "apt update && apt list --upgradable && apt-mark hold postgresql-16 && apt upgrade -y", explanation: "Parcheo mensual: revisa lo que hay pendiente, congela la base de datos para actualizarla aparte y aplica el resto." },
      tags: ["paquetes", "instalar", "actualizar", "debian", "ubuntu", "parches"]
    },
    {
      id: "linux-dnf", name: "dnf / yum", os: "linux", shell: "bash", category: "packages", risk: "caution",
      description: "Gestor de paquetes de RHEL, Rocky, Alma y Fedora.",
      syntax: "dnf install|remove|update|search|info paquete | dnf history",
      flags: [
        { flag: "check-update", description: "Actualizaciones disponibles." },
        { flag: "update --security", description: "Solo parches de seguridad." },
        { flag: "history / history undo N", description: "Historial y deshacer una transacción." },
        { flag: "provides /ruta", description: "Qué paquete contiene un archivo." }
      ],
      example: { command: "dnf check-update --security && dnf update --security -y && needs-restarting -r", explanation: "Aplica solo los parches de seguridad y comprueba si el servidor necesita reiniciar." },
      tags: ["paquetes", "rhel", "rocky", "actualizar", "parches"]
    },
    {
      id: "linux-dpkg-rpm", name: "dpkg -l / rpm -qa", os: "linux", shell: "bash", category: "packages", risk: "safe",
      description: "Inventario de software instalado y búsqueda de qué paquete instaló un archivo.",
      syntax: "dpkg -l [patrón] | dpkg -S archivo | rpm -qa [patrón] | rpm -qf archivo",
      flags: [
        { flag: "dpkg -l | grep", description: "Busca paquetes instalados (Debian)." },
        { flag: "dpkg -S /ruta", description: "Paquete propietario de un archivo." },
        { flag: "rpm -qa --last", description: "Instalados, por fecha (RHEL)." },
        { flag: "rpm -qf /ruta", description: "Paquete propietario de un archivo." }
      ],
      example: { command: "dpkg -l | grep -Ei 'openssl|openssh' || rpm -qa | grep -Ei 'openssl|openssh'", explanation: "Comprueba la versión de OpenSSL/OpenSSH instalada ante un aviso de vulnerabilidad." },
      tags: ["inventario", "instalado", "version", "paquetes", "vulnerabilidad"]
    },

    /* ==================== AMPLIACIÓN · WINDOWS ==================== */

    // ---- Usuarios y permisos
    {
      id: "win-localgroup", name: "Get-LocalGroupMember", os: "windows", shell: "powershell", category: "users", risk: "safe",
      description: "Lista los miembros de un grupo local, por ejemplo quién es administrador del equipo.",
      syntax: "Get-LocalGroupMember -Group <nombre> | Add-LocalGroupMember | Remove-LocalGroupMember",
      flags: [
        { flag: "-Group Administradores", description: "Grupo a consultar (en inglés: Administrators)." },
        { flag: "-SID S-1-5-32-544", description: "SID del grupo Administradores, válido en cualquier idioma." },
        { flag: "net localgroup", description: "Equivalente en CMD." }
      ],
      example: { command: "Invoke-Command -ComputerName (Get-Content .\\equipos.txt) { Get-LocalGroupMember -SID S-1-5-32-544 } | Select-Object PSComputerName, Name, PrincipalSource", explanation: "Auditoría de quién es administrador local en cada equipo, sin depender del idioma del sistema." },
      tags: ["administradores", "grupo local", "auditoria", "privilegios"]
    },
    {
      id: "win-set-executionpolicy", name: "Set-ExecutionPolicy", os: "windows", shell: "powershell", category: "security", risk: "caution",
      description: "Controla qué scripts de PowerShell pueden ejecutarse (no es una barrera de seguridad, sino una protección contra errores).",
      syntax: "Get-ExecutionPolicy -List | Set-ExecutionPolicy <RemoteSigned|AllSigned|Bypass> [-Scope]",
      flags: [
        { flag: "-List", description: "Políticas en cada ámbito." },
        { flag: "RemoteSigned", description: "Scripts descargados deben estar firmados (recomendado)." },
        { flag: "-Scope CurrentUser", description: "Solo para tu usuario (sin admin)." },
        { flag: "Unblock-File", description: "Quita la marca de 'descargado de Internet'." }
      ],
      example: { command: "Set-ExecutionPolicy RemoteSigned -Scope CurrentUser; Unblock-File .\\Scripts\\*.ps1", explanation: "Permite ejecutar tus scripts locales y desbloquea los que copiaste de un recurso descargado." },
      tags: ["scripts", "politica", "powershell", "firmados"]
    },

    // ---- Redes
    {
      id: "win-netipaddress", name: "New-NetIPAddress / Set-DnsClientServerAddress", os: "windows", shell: "powershell", category: "network", risk: "caution",
      description: "Configura IP estática, puerta de enlace y DNS de un adaptador con PowerShell.",
      syntax: "New-NetIPAddress -InterfaceAlias <nic> -IPAddress <ip> -PrefixLength <n> -DefaultGateway <gw>",
      flags: [
        { flag: "Get-NetIPConfiguration", description: "Resumen de IP, puerta de enlace y DNS." },
        { flag: "Get-NetAdapter", description: "Adaptadores y su estado/velocidad." },
        { flag: "Set-DnsClientServerAddress -ServerAddresses", description: "Servidores DNS." },
        { flag: "Set-NetIPInterface -Dhcp Enabled", description: "Vuelve a DHCP." }
      ],
      example: { command: "New-NetIPAddress -InterfaceAlias 'Ethernet' -IPAddress 10.0.0.25 -PrefixLength 24 -DefaultGateway 10.0.0.1; Set-DnsClientServerAddress -InterfaceAlias 'Ethernet' -ServerAddresses 10.0.0.10,10.0.0.11", explanation: "Configura un servidor recién instalado (Server Core incluido) con IP fija y los DNS de los controladores de dominio." },
      tags: ["ip", "estatica", "dns", "adaptador", "red"]
    },
    {
      id: "win-route-arp", name: "route print / arp -a", os: "windows", shell: "cmd", category: "network", risk: "caution",
      description: "Muestra y modifica la tabla de rutas y la caché ARP del equipo.",
      syntax: "route print | route [-p] add red mask máscara gateway | arp -a | arp -d *",
      flags: [
        { flag: "route print -4", description: "Tabla de rutas IPv4." },
        { flag: "route -p add", description: "Ruta persistente (sobrevive al reinicio)." },
        { flag: "arp -a", description: "Tabla IP ↔ MAC." },
        { flag: "arp -d *", description: "Vacía la caché ARP (requiere admin)." }
      ],
      example: { command: "route -p add 172.16.50.0 mask 255.255.255.0 10.0.0.254 && route print 172.16.*", explanation: "Añade una ruta persistente hacia la red de gestión a través de un router secundario." },
      tags: ["rutas", "arp", "mac", "gateway", "tabla"]
    },
    {
      id: "win-smbshare", name: "Get-SmbShare / New-SmbShare", os: "windows", shell: "powershell", category: "network", risk: "caution",
      description: "Gestiona carpetas compartidas SMB y revisa sesiones y archivos abiertos.",
      syntax: "New-SmbShare -Name <n> -Path <ruta> [-FullAccess] [-ChangeAccess] [-ReadAccess] | Get-SmbOpenFile",
      flags: [
        { flag: "Get-SmbShare", description: "Recursos compartidos del servidor." },
        { flag: "Get-SmbSession", description: "Quién está conectado." },
        { flag: "Get-SmbOpenFile | Close-SmbOpenFile", description: "Cierra un archivo bloqueado." },
        { flag: "net share / net use", description: "Equivalentes en CMD." }
      ],
      example: { command: "Get-SmbOpenFile | Where-Object Path -like '*Presupuesto2026.xlsx' | Select-Object ClientUserName, ClientComputerName, Path", explanation: "«El Excel está bloqueado por otro usuario»: averigua quién lo tiene abierto (y ciérralo con Close-SmbOpenFile si hace falta)." },
      tags: ["compartida", "smb", "carpeta", "archivo bloqueado", "share"]
    },
    {
      id: "win-openssh", name: "ssh / scp (OpenSSH)", os: "windows", shell: "powershell", category: "network", risk: "safe",
      description: "Windows 10/11 y Server 2019+ incluyen cliente OpenSSH nativo; el servidor se instala como característica opcional.",
      syntax: "ssh usuario@host | scp archivo usuario@host:/ruta | Add-WindowsCapability -Online -Name OpenSSH.Server*",
      flags: [
        { flag: "ssh -J bastion", description: "Salto por bastión, igual que en Linux." },
        { flag: "ssh-keygen -t ed25519", description: "Genera claves desde Windows." },
        { flag: "Add-WindowsCapability", description: "Instala el servidor SSH." },
        { flag: "Start-Service sshd", description: "Arranca el servicio." }
      ],
      example: { command: "Add-WindowsCapability -Online -Name OpenSSH.Server~~~~0.0.1.0; Set-Service sshd -StartupType Automatic; Start-Service sshd", explanation: "Habilita SSH en un servidor Windows para administrarlo igual que tus servidores Linux." },
      tags: ["ssh", "remoto", "openssh", "scp", "acceso"]
    },

    // ---- Procesos / sistema
    {
      id: "win-systeminfo", name: "systeminfo / Get-ComputerInfo", os: "windows", shell: "cmd", category: "processes", risk: "safe",
      description: "Información completa del sistema: versión de Windows, último arranque, RAM, dominio, parches instalados.",
      syntax: "systeminfo [/S equipo] [/FO CSV] | Get-ComputerInfo [-Property ...]",
      flags: [
        { flag: "/S equipo", description: "Consulta un equipo remoto." },
        { flag: "/FO CSV", description: "Salida en CSV." },
        { flag: "Get-CimInstance Win32_OperatingSystem", description: "Datos del SO en PowerShell." },
        { flag: "Get-HotFix", description: "Parches instalados." }
      ],
      example: { command: "Get-CimInstance Win32_OperatingSystem | Select-Object CSName, Caption, Version, LastBootUpTime, @{n='RAM libre GB';e={[math]::Round($_.FreePhysicalMemory/1MB,1)}}", explanation: "Ficha rápida: versión exacta, último reinicio y memoria libre de un servidor." },
      tags: ["sistema", "informacion", "version", "arranque", "inventario"]
    },
    {
      id: "win-restart-computer", name: "Restart-Computer / shutdown", os: "windows", shell: "powershell", category: "processes", risk: "danger",
      description: "Reinicia o apaga equipos locales o remotos. En un servidor de producción corta el servicio a todos los usuarios.",
      syntax: "Restart-Computer [-ComputerName] [-Force] [-Wait -For PowerShell] | shutdown /r /t seg /c 'motivo'",
      flags: [
        { flag: "-Wait -For PowerShell", description: "Espera a que el equipo vuelva a estar disponible." },
        { flag: "-Force", description: "Fuerza aunque haya usuarios conectados." },
        { flag: "shutdown /r /t 300 /c", description: "Reinicio en 5 min con aviso." },
        { flag: "shutdown /a", description: "Cancela un reinicio programado." }
      ],
      example: { command: "shutdown /r /t 600 /c \"Reinicio por parches de seguridad en 10 minutos. Guarde su trabajo.\" /d p:2:17", explanation: "Avisa a los usuarios del servidor RDS 10 minutos antes del reinicio y registra el motivo. 'shutdown /a' lo cancela." },
      tags: ["reiniciar", "apagar", "reboot", "shutdown", "remoto"]
    },
    {
      id: "win-get-hotfix", name: "Get-HotFix", os: "windows", shell: "powershell", category: "packages", risk: "safe",
      description: "Lista las actualizaciones (KB) instaladas en equipos locales o remotos.",
      syntax: "Get-HotFix [-Id KBxxxxx] [-ComputerName]",
      flags: [
        { flag: "-Id KB5034441", description: "Comprueba un parche concreto." },
        { flag: "-ComputerName", description: "Equipos remotos." },
        { flag: "Sort-Object InstalledOn", description: "Ordena por fecha." }
      ],
      example: { command: "Get-HotFix -ComputerName (Get-Content .\\servidores.txt) -Id KB5044284 -ErrorAction SilentlyContinue | Select-Object PSComputerName, HotFixID, InstalledOn", explanation: "Verifica en qué servidores está instalado el parche crítico del mes." },
      tags: ["parches", "kb", "actualizaciones", "windows update"]
    },

    // ---- Seguridad
    {
      id: "win-sfc-dism", name: "sfc /scannow / DISM", os: "windows", shell: "cmd", category: "security", risk: "caution",
      description: "Repara archivos de sistema corruptos (SFC) y la imagen de Windows de la que se restauran (DISM).",
      syntax: "DISM /Online /Cleanup-Image /RestoreHealth | sfc /scannow",
      flags: [
        { flag: "/CheckHealth / /ScanHealth", description: "Comprueba la imagen sin reparar." },
        { flag: "/RestoreHealth", description: "Repara usando Windows Update." },
        { flag: "/Source:wim:D:\\sources\\install.wim:1", description: "Repara desde una ISO (sin Internet)." },
        { flag: "sfc /scannow", description: "Verifica y repara archivos protegidos." }
      ],
      example: { command: "DISM /Online /Cleanup-Image /RestoreHealth && sfc /scannow", explanation: "Secuencia estándar ante errores extraños de Windows o actualizaciones que fallan: primero se repara la imagen y luego los archivos." },
      tags: ["reparar", "corrupcion", "sistema", "integridad", "dism"]
    },
    {
      id: "win-manage-bde", name: "manage-bde / Get-BitLockerVolume", os: "windows", shell: "cmd", category: "security", risk: "caution",
      description: "Gestiona BitLocker: estado de cifrado, protectores y clave de recuperación.",
      syntax: "manage-bde -status [C:] | manage-bde -protectors -get C: | manage-bde -on C:",
      flags: [
        { flag: "-status", description: "Estado de cifrado de cada volumen." },
        { flag: "-protectors -get C:", description: "Muestra la clave de recuperación." },
        { flag: "-protectors -disable C: -RebootCount 1", description: "Suspende BitLocker un reinicio (actualizar BIOS)." },
        { flag: "Backup-BitLockerKeyProtector", description: "Guarda la clave en AD / Entra ID." }
      ],
      example: { command: "manage-bde -protectors -disable C: -RebootCount 1", explanation: "Suspende BitLocker durante un único reinicio para actualizar la BIOS sin que pida la clave de recuperación." },
      tags: ["bitlocker", "cifrado", "recuperacion", "disco", "tpm"]
    },
    {
      id: "win-cipher-wipe", name: "cipher /w", os: "windows", shell: "cmd", category: "security", risk: "danger",
      description: "Sobrescribe el espacio libre de un volumen para que los archivos borrados no puedan recuperarse. Muy intensivo en disco.",
      syntax: "cipher /w:unidad:\\carpeta",
      flags: [
        { flag: "/w:", description: "Borra de forma segura el espacio libre." },
        { flag: "/e / /d", description: "Cifra / descifra con EFS." }
      ],
      example: { command: "cipher /w:D:\\", explanation: "Antes de devolver un disco o equipo de leasing, elimina cualquier rastro recuperable de los archivos ya borrados." },
      tags: ["borrado seguro", "wipe", "espacio libre", "destructivo"]
    },

    // ---- Automatización
    {
      id: "win-foreach-parallel", name: "ForEach-Object -Parallel / Start-Job", os: "windows", shell: "powershell", category: "automation", risk: "safe",
      description: "Ejecuta tareas en paralelo: -Parallel (PowerShell 7+) o trabajos en segundo plano (Start-Job).",
      syntax: "... | ForEach-Object -Parallel { ... } -ThrottleLimit N | Start-Job { ... } | Receive-Job",
      flags: [
        { flag: "-ThrottleLimit 20", description: "Hilos simultáneos." },
        { flag: "$using:var", description: "Usa variables externas dentro del bloque paralelo." },
        { flag: "Start-Job / Wait-Job / Receive-Job", description: "Trabajos en segundo plano (PS 5.1)." }
      ],
      example: { command: "Get-Content .\\equipos.txt | ForEach-Object -Parallel { [pscustomobject]@{Equipo=$_; Online=(Test-Connection $_ -Count 1 -Quiet -TimeoutSeconds 1)} } -ThrottleLimit 50", explanation: "Hace ping a cientos de equipos en segundos en lugar de uno a uno." },
      tags: ["paralelo", "jobs", "rapido", "masivo", "scripting"]
    },
    {
      id: "win-export-csv", name: "Export-Csv / ConvertTo-Html", os: "windows", shell: "powershell", category: "automation", risk: "safe",
      description: "Convierte cualquier salida de PowerShell en CSV (para Excel) o en un informe HTML.",
      syntax: "... | Export-Csv <archivo> -NoTypeInformation [-Delimiter ';'] [-Encoding UTF8]",
      flags: [
        { flag: "-Delimiter ';'", description: "Separador para Excel en español." },
        { flag: "-Encoding UTF8", description: "Conserva tildes y eñes." },
        { flag: "Import-Csv", description: "Lee un CSV como objetos." },
        { flag: "ConvertTo-Html -Title", description: "Genera un informe HTML." }
      ],
      example: { command: "Get-Service | Where-Object Status -eq 'Stopped' | Select-Object Name, DisplayName, StartType | Export-Csv C:\\Informes\\servicios.csv -NoTypeInformation -Delimiter ';' -Encoding UTF8", explanation: "Informe listo para abrir en Excel con tildes correctas y columnas separadas." },
      tags: ["csv", "excel", "informe", "exportar", "html"]
    },
    {
      id: "win-start-transcript", name: "Start-Transcript", os: "windows", shell: "powershell", category: "automation", risk: "safe",
      description: "Graba en un archivo todo lo que ocurre en la sesión de PowerShell: comandos y salida. Ideal como evidencia de cambios.",
      syntax: "Start-Transcript -Path <archivo> [-Append] ... Stop-Transcript",
      flags: [
        { flag: "-Path", description: "Archivo de registro." },
        { flag: "-Append", description: "Añade sin sobrescribir." },
        { flag: "Stop-Transcript", description: "Termina la grabación." }
      ],
      example: { command: "Start-Transcript -Path \"C:\\Logs\\cambio-CHG1234-$(Get-Date -Format yyyyMMdd-HHmm).txt\"", explanation: "Deja constancia de todo lo ejecutado durante una ventana de cambio, asociado al número de petición." },
      tags: ["registro", "log", "evidencia", "auditoria", "sesion"]
    },

    // ---- Almacenamiento
    {
      id: "win-initialize-disk", name: "Get-Disk / Initialize-Disk / New-Partition", os: "windows", shell: "powershell", category: "storage", risk: "danger",
      description: "Prepara un disco nuevo con PowerShell: inicializar, particionar y formatear. Sobre un disco con datos los destruye.",
      syntax: "Get-Disk | Initialize-Disk -Number N -PartitionStyle GPT | New-Partition -UseMaximumSize -AssignDriveLetter | Format-Volume",
      flags: [
        { flag: "Get-Disk | Where PartitionStyle -eq RAW", description: "Solo discos sin inicializar (seguros)." },
        { flag: "-PartitionStyle GPT", description: "Estilo de partición moderno." },
        { flag: "Set-Disk -IsOffline $false", description: "Pone online un disco (SAN, clústeres)." }
      ],
      example: { command: "Get-Disk | Where-Object PartitionStyle -eq 'RAW' | Initialize-Disk -PartitionStyle GPT -PassThru | New-Partition -UseMaximumSize -AssignDriveLetter | Format-Volume -FileSystem NTFS -NewFileSystemLabel 'Datos' -Confirm:$false", explanation: "Inicializa y formatea solo los discos vacíos (RAW) recién añadidos a la VM, sin tocar los existentes." },
      tags: ["disco", "inicializar", "particion", "formatear", "nuevo"]
    },
    {
      id: "win-resize-partition", name: "Resize-Partition", os: "windows", shell: "powershell", category: "storage", risk: "caution",
      description: "Amplía o reduce una partición; típico tras ampliar el disco virtual en el hipervisor.",
      syntax: "Resize-Partition -DriveLetter X -Size (Get-PartitionSupportedSize -DriveLetter X).SizeMax",
      flags: [
        { flag: "Get-PartitionSupportedSize", description: "Tamaños mínimo y máximo posibles." },
        { flag: "Update-HostStorageCache", description: "Reescanea discos para ver el nuevo tamaño." },
        { flag: "diskpart > extend", description: "Alternativa clásica." }
      ],
      example: { command: "Update-HostStorageCache; Resize-Partition -DriveLetter C -Size (Get-PartitionSupportedSize -DriveLetter C).SizeMax", explanation: "Tras ampliar el disco de la VM, extiende C: a todo el espacio disponible sin reiniciar." },
      tags: ["ampliar", "particion", "extender", "disco", "vm"]
    },
    {
      id: "win-vssadmin", name: "vssadmin", os: "windows", shell: "cmd", category: "storage", risk: "danger",
      description: "Gestiona instantáneas de volumen (Shadow Copies / versiones anteriores). Borrarlas elimina puntos de restauración.",
      syntax: "vssadmin list shadows|writers|shadowstorage | vssadmin delete shadows /for=X: [/oldest]",
      flags: [
        { flag: "list writers", description: "Estado de los writers VSS (fallos de backup)." },
        { flag: "list shadowstorage", description: "Espacio usado por las instantáneas." },
        { flag: "resize shadowstorage", description: "Limita el espacio máximo." },
        { flag: "delete shadows /oldest", description: "Borra la instantánea más antigua." }
      ],
      example: { command: "vssadmin list writers | findstr /i \"Writer name State Last error\"", explanation: "El backup falla con error VSS: revisa qué writer está en estado de error (suele resolverse reiniciando su servicio)." },
      tags: ["vss", "instantaneas", "backup", "shadow copy", "restauracion"]
    },
    {
      id: "win-optimize-volume", name: "Optimize-Volume", os: "windows", shell: "powershell", category: "storage", risk: "safe",
      description: "Desfragmenta discos HDD o envía TRIM a SSD.",
      syntax: "Optimize-Volume -DriveLetter X [-Analyze] [-Defrag] [-ReTrim] [-Verbose]",
      flags: [
        { flag: "-Analyze", description: "Solo analiza la fragmentación." },
        { flag: "-ReTrim", description: "Envía TRIM (SSD y discos thin)." },
        { flag: "-Defrag", description: "Desfragmenta (HDD)." }
      ],
      example: { command: "Optimize-Volume -DriveLetter D -ReTrim -Verbose", explanation: "Devuelve al almacenamiento thin provisioning (SAN/hipervisor) el espacio de los archivos borrados." },
      tags: ["desfragmentar", "trim", "ssd", "rendimiento"]
    },

    // ---- Paquetes
    {
      id: "win-winget", name: "winget", os: "windows", shell: "cmd", category: "packages", risk: "caution",
      description: "Gestor de paquetes oficial de Windows: instala, actualiza y desinstala software desde la línea de comandos.",
      syntax: "winget search|install|upgrade|uninstall|list|export|import [--id] [--silent]",
      flags: [
        { flag: "upgrade --all", description: "Actualiza todo lo que se pueda." },
        { flag: "install --id X -e --silent", description: "Instalación desatendida por ID exacto." },
        { flag: "export -o apps.json", description: "Exporta la lista de apps instaladas." },
        { flag: "import -i apps.json", description: "Reinstala esa lista en otro equipo." }
      ],
      example: { command: "winget install --id Notepad++.Notepad++ -e --silent --accept-package-agreements --accept-source-agreements && winget upgrade --all --silent", explanation: "Prepara un puesto de trabajo instalando software sin ventanas y dejando todo actualizado." },
      tags: ["instalar", "software", "actualizar", "paquetes", "apps"]
    },
    {
      id: "win-windowsfeature", name: "Install-WindowsFeature", os: "windows", shell: "powershell", category: "packages", risk: "caution",
      description: "Instala o quita roles y características de Windows Server (IIS, DHCP, AD DS, RSAT…).",
      syntax: "Get-WindowsFeature [*nombre*] | Install-WindowsFeature <nombre> [-IncludeManagementTools] [-Restart]",
      flags: [
        { flag: "Get-WindowsFeature | Where Installed", description: "Roles instalados." },
        { flag: "-IncludeManagementTools", description: "Instala también las consolas." },
        { flag: "-Restart", description: "Reinicia si es necesario." },
        { flag: "Add-WindowsCapability RSAT*", description: "RSAT en Windows 10/11 cliente." }
      ],
      example: { command: "Install-WindowsFeature Web-Server, Web-Asp-Net45, Web-Mgmt-Console -IncludeManagementTools", explanation: "Instala IIS con ASP.NET y su consola en un servidor nuevo." },
      tags: ["roles", "caracteristicas", "iis", "rsat", "server"]
    },
    {
      id: "win-pswindowsupdate", name: "Get-WindowsUpdate (PSWindowsUpdate)", os: "windows", shell: "powershell", category: "packages", risk: "caution",
      description: "Busca e instala actualizaciones de Windows desde PowerShell, incluso en remoto (módulo PSWindowsUpdate de la Galería).",
      syntax: "Install-Module PSWindowsUpdate | Get-WindowsUpdate | Install-WindowsUpdate [-AcceptAll] [-AutoReboot]",
      flags: [
        { flag: "Get-WindowsUpdate", description: "Actualizaciones pendientes." },
        { flag: "-AcceptAll -IgnoreReboot", description: "Instala todo sin reiniciar." },
        { flag: "-KBArticleID KBxxxx", description: "Una actualización concreta." },
        { flag: "Get-WUHistory", description: "Historial de instalaciones." }
      ],
      example: { command: "Install-Module PSWindowsUpdate -Scope CurrentUser -Force; Get-WindowsUpdate; Install-WindowsUpdate -AcceptAll -IgnoreReboot", explanation: "Parchea un servidor Core sin interfaz y deja el reinicio para la ventana de mantenimiento." },
      tags: ["windows update", "parches", "actualizaciones", "remoto"]
    },

    // ---- Active Directory
    {
      id: "win-get-adcomputer", name: "Get-ADComputer", os: "windows", shell: "powershell", category: "ad", risk: "safe",
      description: "Consulta equipos del dominio: sistema operativo, último inicio de sesión, OU.",
      syntax: "Get-ADComputer -Identity <n> | -Filter <f> [-Properties OperatingSystem,LastLogonDate]",
      flags: [
        { flag: "-Properties OperatingSystem", description: "Versión de Windows." },
        { flag: "LastLogonDate", description: "Último contacto con el dominio (aprox. 14 días de precisión)." },
        { flag: "-SearchBase 'OU=...'", description: "Limita a una OU." }
      ],
      example: { command: "Get-ADComputer -Filter 'OperatingSystem -like \"*Server*\"' -Properties OperatingSystem, LastLogonDate | Sort-Object OperatingSystem | Select-Object Name, OperatingSystem, LastLogonDate", explanation: "Inventario de servidores por versión de Windows: detecta los que están fuera de soporte." },
      tags: ["equipos", "inventario", "sistema operativo", "dominio"]
    },
    {
      id: "win-disable-adaccount", name: "Disable-ADAccount / Move-ADObject", os: "windows", shell: "powershell", category: "ad", risk: "caution",
      description: "Deshabilita cuentas de usuario o equipo y las mueve a una OU de bajas.",
      syntax: "Disable-ADAccount -Identity <u> | Move-ADObject -Identity <DN> -TargetPath <OU>",
      flags: [
        { flag: "Enable-ADAccount", description: "Vuelve a habilitar." },
        { flag: "Set-ADUser -Description", description: "Anota el motivo y la fecha." },
        { flag: "Remove-ADGroupMember", description: "Quita sus grupos." }
      ],
      example: { command: "$u = Get-ADUser jlopez; Disable-ADAccount $u; Set-ADUser $u -Description \"Baja $(Get-Date -Format d) - RRHH-5521\"; Move-ADObject $u.DistinguishedName -TargetPath 'OU=Bajas,DC=corp,DC=local'", explanation: "Procedimiento de baja: deshabilita, documenta el motivo y mueve la cuenta a la OU de bajas." },
      tags: ["baja", "deshabilitar", "mover", "ou", "offboarding"]
    },
    {
      id: "win-get-gpo", name: "Get-GPO / Backup-GPO", os: "windows", shell: "powershell", category: "ad", risk: "safe",
      description: "Consulta, informa y respalda objetos de directiva de grupo (GPO).",
      syntax: "Get-GPO -All | Backup-GPO -All -Path <dir> | Get-GPOReport -Name <n> -ReportType Html",
      flags: [
        { flag: "Backup-GPO -All -Path", description: "Copia de seguridad de todas las GPO." },
        { flag: "Get-GPOReport -ReportType Html", description: "Informe legible de una GPO." },
        { flag: "Restore-GPO", description: "Restaura desde una copia." },
        { flag: "Get-GPInheritance -Target OU", description: "GPO aplicadas a una OU." }
      ],
      example: { command: "Backup-GPO -All -Path \"\\\\fs01\\Backups\\GPO\\$(Get-Date -Format yyyy-MM-dd)\"", explanation: "Copia de seguridad de todas las directivas antes de un cambio importante; con Restore-GPO se vuelve atrás." },
      tags: ["gpo", "directivas", "backup", "informe"]
    },
    {
      id: "win-secure-channel", name: "Test-ComputerSecureChannel", os: "windows", shell: "powershell", category: "ad", risk: "caution",
      description: "Comprueba y repara la relación de confianza entre un equipo y el dominio sin sacarlo y volverlo a unir.",
      syntax: "Test-ComputerSecureChannel [-Repair] [-Credential dominio\\admin]",
      flags: [
        { flag: "(sin parámetros)", description: "Devuelve True/False." },
        { flag: "-Repair", description: "Restablece la contraseña de la cuenta de equipo." },
        { flag: "-Credential", description: "Cuenta con permisos en el dominio." },
        { flag: "nltest /sc_verify:dominio", description: "Alternativa en CMD." }
      ],
      example: { command: "Test-ComputerSecureChannel -Repair -Credential CORP\\adm.jlopez", explanation: "Soluciona el error «La relación de confianza entre esta estación de trabajo y el dominio principal falló» sin reiniciar." },
      tags: ["confianza", "dominio", "trust", "reparar", "equipo"]
    },
    {
      id: "win-get-addomaincontroller", name: "Get-ADDomainController / netdom query fsmo", os: "windows", shell: "powershell", category: "ad", risk: "safe",
      description: "Lista los controladores de dominio y localiza quién tiene los roles FSMO.",
      syntax: "Get-ADDomainController -Filter * | netdom query fsmo | nltest /dsgetdc:dominio",
      flags: [
        { flag: "-Filter *", description: "Todos los DC del dominio." },
        { flag: "-Discover", description: "El DC que usaría este equipo." },
        { flag: "netdom query fsmo", description: "Titulares de los 5 roles FSMO." },
        { flag: "IsGlobalCatalog", description: "Si el DC es catálogo global." }
      ],
      example: { command: "Get-ADDomainController -Filter * | Select-Object Name, Site, IPv4Address, OperatingSystem, IsGlobalCatalog; netdom query fsmo", explanation: "Mapa rápido de los DC por sede y de los roles FSMO antes de retirar un controlador antiguo." },
      tags: ["dc", "fsmo", "controladores", "sitios", "catalogo global"]
    },

    /* ========== STACK WEB · UBUNTU + APACHE + MARIADB ========== */
    /* Formato de log asumido: "combined" de Apache en Ubuntu
       ($1 IP · $4 fecha · $6 "MÉTODO · $7 ruta · $9 código · $10 bytes). */

    // ---- Monitoreo de red e interconexión
    {
      id: "web-apachetop", name: "apachetop", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "«top» para Apache: muestra en tiempo real las URLs, IPs y códigos HTTP más solicitados leyendo el access.log.",
      syntax: "apachetop [-f access.log] [-T segundos] [-H hits]",
      requires: "sudo apt install apachetop",
      flags: [
        { flag: "-f archivo", description: "Log a vigilar (se puede repetir para varios vhosts)." },
        { flag: "-T 60", description: "Ventana de tiempo para las estadísticas." },
        { flag: "d / n (teclas)", description: "Alterna entre URLs, referers e IPs / ordena." }
      ],
      example: { command: "sudo apachetop -f /var/log/apache2/access.log -f /var/log/apache2/other_vhosts_access.log -T 60", explanation: "Durante un pico de tráfico, ves al instante qué URL o qué IP está generando la carga en el último minuto." },
      tags: ["apache", "http", "tiempo real", "trafico", "urls"]
    },
    {
      id: "web-server-status", name: "mod_status (server-status)", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Marcador interno de Apache: workers ocupados/libres, peticiones por segundo y qué está atendiendo cada proceso en este momento.",
      syntax: "curl -s 'http://localhost/server-status?auto'  |  apache2ctl fullstatus",
      requires: "mod_status (activo por defecto en Ubuntu, limitado a localhost). Para fullstatus: sudo apt install lynx",
      flags: [
        { flag: "?auto", description: "Salida en texto plano para scripts." },
        { flag: "BusyWorkers / IdleWorkers", description: "Si Idle llega a 0, Apache está saturado." },
        { flag: "ExtendedStatus On", description: "Incluye URL y cliente de cada worker." },
        { flag: "Scoreboard", description: "_ libre · W enviando · K keep-alive · R leyendo." }
      ],
      example: { command: "watch -n 2 \"curl -s 'http://localhost/server-status?auto' | grep -E 'BusyWorkers|IdleWorkers|ReqPerSec|Scoreboard'\"", explanation: "Monitoriza en directo la ocupación de Apache: si los workers libres caen a cero, las peticiones empiezan a hacer cola." },
      tags: ["apache", "workers", "estado", "saturacion", "scoreboard"]
    },
    {
      id: "web-ss-per-ip", name: "ss (conexiones HTTP por IP)", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Cuenta las conexiones establecidas a los puertos 80/443 agrupadas por IP remota: detecta flood o clientes abusivos.",
      syntax: "ss -Htn state established '( sport = :80 or sport = :443 )'",
      requires: "Nativo (iproute2).",
      flags: [
        { flag: "-H", description: "Sin cabecera (más fácil de procesar)." },
        { flag: "state established", description: "Solo conexiones activas." },
        { flag: "'( sport = :443 )'", description: "Filtro nativo de ss, más rápido que grep." },
        { flag: "state syn-recv", description: "Conexiones a medio abrir (posible SYN flood)." }
      ],
      example: { command: "ss -Htn state established '( sport = :80 or sport = :443 )' | awk '{print $4}' | sed -E 's/:[0-9]+$//' | sort | uniq -c | sort -nr | head -n 15", explanation: "Las 15 IPs con más conexiones abiertas contra Apache. Una sola IP con cientos de conexiones suele ser un bot o un ataque." },
      tags: ["conexiones", "apache", "flood", "ddos", "ip"]
    },
    {
      id: "web-ngrep", name: "ngrep (HTTP en vivo)", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Captura y muestra las peticiones HTTP en claro que llegan al servidor, como un grep sobre el tráfico de red.",
      syntax: "ngrep -q -W byline -d any 'patrón' 'filtro BPF'",
      requires: "sudo apt install ngrep · Solo ve HTTP sin cifrar (puerto 80 o tráfico interno entre proxy y Apache).",
      flags: [
        { flag: "-q", description: "Modo silencioso (solo coincidencias)." },
        { flag: "-W byline", description: "Respeta los saltos de línea de las cabeceras." },
        { flag: "-d any", description: "Todas las interfaces." },
        { flag: "'^(GET|POST)'", description: "Solo líneas de petición." }
      ],
      example: { command: "sudo ngrep -q -W byline -d any '^(GET|POST) ' 'tcp dst port 80'", explanation: "Ver en directo qué peticiones llegan por HTTP (por ejemplo, para confirmar si un bot sigue entrando por el puerto 80 o por qué no redirige a HTTPS)." },
      tags: ["http", "captura", "peticiones", "sniffer", "debug"]
    },
    {
      id: "web-curl-timing", name: "curl -w (desglose de latencia)", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Desglosa el tiempo de una petición en DNS, TCP, TLS, primer byte (TTFB) y total para saber dónde se pierde el tiempo.",
      syntax: "curl -o /dev/null -s -w 'formato' URL",
      requires: "Nativo (curl).",
      flags: [
        { flag: "%{time_namelookup}", description: "Resolución DNS." },
        { flag: "%{time_connect}", description: "Conexión TCP establecida." },
        { flag: "%{time_appconnect}", description: "Negociación TLS terminada." },
        { flag: "%{time_starttransfer}", description: "TTFB: el servidor empieza a responder (PHP + MariaDB)." }
      ],
      example: { command: "curl -o /dev/null -s -w 'dns:%{time_namelookup}s tcp:%{time_connect}s tls:%{time_appconnect}s ttfb:%{time_starttransfer}s total:%{time_total}s http:%{http_code}\\n' https://tu-dominio.com/", explanation: "Si el TTFB es alto pero DNS/TCP/TLS son rápidos, el cuello de botella está en la aplicación o en la base de datos, no en la red." },
      tags: ["latencia", "ttfb", "rendimiento", "tls", "dns"]
    },
    {
      id: "web-logtop", name: "logtop", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Ranking en tiempo real de cualquier campo de un log (IP, URL, user-agent) con frecuencia por segundo.",
      syntax: "tail -F access.log | awk '{print $campo}' | logtop",
      requires: "sudo apt install logtop",
      flags: [
        { flag: "$1 / $7", description: "IP de origen / URL solicitada." },
        { flag: "-s N", description: "Tamaño del historial." },
        { flag: "--line-buffered", description: "Evita retrasos en la tubería." }
      ],
      example: { command: "tail -F /var/log/apache2/access.log | awk '{print $1, $7; fflush()}' | logtop", explanation: "Ve en directo qué combinación IP + URL martillea el servidor: típico de un bot atacando wp-login.php o un buscador." },
      tags: ["tiempo real", "ranking", "ip", "url", "logs"]
    },
    {
      id: "web-goaccess", name: "goaccess", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Analizador de logs web: visitantes, URLs, códigos de error, bots, ancho de banda… en terminal o como informe HTML.",
      syntax: "goaccess access.log --log-format=COMBINED [-o informe.html] [--real-time-html]",
      requires: "sudo apt install goaccess",
      flags: [
        { flag: "--log-format=COMBINED", description: "Formato por defecto de Apache en Ubuntu." },
        { flag: "-o informe.html", description: "Genera informe HTML." },
        { flag: "--ignore-crawlers", description: "Excluye bots conocidos." },
        { flag: "zcat -f", description: "Incluye logs rotados comprimidos." }
      ],
      example: { command: "zcat -f /var/log/apache2/access.log* | goaccess - --log-format=COMBINED -o /root/informe-web-$(date +%F).html", explanation: "Informe de las últimas semanas (logs rotados incluidos). Se guarda fuera de /var/www para no exponerlo públicamente." },
      tags: ["estadisticas", "informe", "visitas", "logs", "apache"]
    },

    // ---- Rendimiento y diagnóstico de procesos
    {
      id: "web-apache2ctl", name: "apache2ctl -V / -M / -S", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Radiografía de Apache: MPM en uso (prefork/event), módulos cargados y virtual hosts con el archivo que los define.",
      syntax: "apache2ctl -V | -M | -S | configtest",
      requires: "Nativo (apache2).",
      flags: [
        { flag: "-V", description: "Versión, MPM y rutas de compilación." },
        { flag: "-M", description: "Módulos cargados." },
        { flag: "-S", description: "VirtualHosts, puertos y archivo de cada uno." },
        { flag: "configtest", description: "Valida la sintaxis sin reiniciar." }
      ],
      example: { command: "apache2ctl -V | grep -i mpm && apache2ctl -M 2>/dev/null | grep -E 'mpm|php|proxy_fcgi|http2|ssl' && apache2ctl -S", explanation: "Si ves mpm_prefork + php_module, Apache usa mod_php: migrar a mpm_event + PHP-FPM reduce mucho el consumo de RAM." },
      tags: ["apache", "mpm", "modulos", "vhosts", "configuracion"]
    },
    {
      id: "web-apache-rss", name: "ps (RAM por proceso de Apache)", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Calcula cuánta memoria usa de media cada proceso de Apache para dimensionar MaxRequestWorkers sin agotar la RAM.",
      syntax: "ps -C apache2 -o rss= | awk '...'",
      requires: "Nativo.",
      flags: [
        { flag: "-C apache2", description: "Solo procesos de Apache." },
        { flag: "-o rss=", description: "Memoria residente en KB, sin cabecera." },
        { flag: "MaxRequestWorkers", description: "≈ (RAM para Apache) / (media por proceso)." }
      ],
      example: { command: "ps -C apache2 -o rss= | awk '{s+=$1; n++} END {printf \"procesos=%d  media=%.1f MB  total=%.1f MB\\n\", n, s/n/1024, s/1024}'", explanation: "Con 4 GB libres para Apache y 60 MB de media por proceso, MaxRequestWorkers no debería pasar de ~65. Si se sobredimensiona, el servidor acaba usando swap." },
      tags: ["apache", "memoria", "ram", "maxrequestworkers", "tuning"]
    },
    {
      id: "web-apache-errors", name: "grep (saturación en error.log)", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Busca en el error.log los avisos de Apache que indican saturación, timeouts o caídas de PHP-FPM.",
      syntax: "grep -E 'AH00161|AH00484|AH01071|AH01067' /var/log/apache2/error.log",
      requires: "Nativo.",
      flags: [
        { flag: "AH00161 / AH00484", description: "Se alcanzó MaxRequestWorkers (peticiones en cola)." },
        { flag: "AH01071", description: "Error devuelto por PHP-FPM." },
        { flag: "AH01067 / timeout", description: "El backend no respondió a tiempo." },
        { flag: "zgrep", description: "Busca también en logs rotados .gz." }
      ],
      example: { command: "zgrep -hE 'AH00161|AH00484|MaxRequestWorkers|AH01071|timed out' /var/log/apache2/error.log* | awk '{print substr($5,1,4), $2, $3}' | sort | uniq -c | tail -n 20", explanation: "Cuenta por día los avisos de saturación: si coinciden con las quejas de lentitud, hay que ajustar workers o PHP-FPM." },
      tags: ["apache", "errores", "saturacion", "php-fpm", "timeout"]
    },
    {
      id: "web-mariadb-status", name: "mariadb-admin extended-status", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Muestra cada N segundos la variación de los contadores clave de MariaDB: conexiones, consultas por segundo y consultas lentas.",
      syntax: "mariadb-admin [-u root -p] extended-status -r -i segundos",
      requires: "Nativo (mariadb-client). En Ubuntu, root entra por socket con sudo sin contraseña.",
      flags: [
        { flag: "-r -i 5", description: "Diferencia respecto a la muestra anterior, cada 5 s." },
        { flag: "Threads_running", description: "Consultas ejecutándose a la vez (alto = contención)." },
        { flag: "Slow_queries", description: "Nuevas consultas lentas en el intervalo." },
        { flag: "Questions", description: "Consultas por intervalo." }
      ],
      example: { command: "sudo mariadb-admin extended-status -r -i 5 | grep -E 'Threads_(connected|running)|Questions |Slow_queries|Aborted_connects'", explanation: "Durante un pico, ves si MariaDB es el cuello de botella: Threads_running disparado o Slow_queries creciendo." },
      tags: ["mariadb", "mysql", "rendimiento", "conexiones", "consultas"]
    },
    {
      id: "web-mariadb-processlist", name: "SHOW PROCESSLIST (consultas activas)", os: "linux", shell: "bash", category: "processes", risk: "caution",
      description: "Lista las consultas en ejecución con su duración para localizar la que bloquea la base de datos. KILL la cancela.",
      syntax: "mariadb -e \"SELECT ... FROM information_schema.processlist ...\"  |  KILL QUERY id",
      requires: "Nativo (mariadb-client).",
      flags: [
        { flag: "command <> 'Sleep'", description: "Oculta conexiones inactivas." },
        { flag: "time > 5", description: "Solo consultas de más de 5 s." },
        { flag: "KILL QUERY id", description: "Cancela la consulta, mantiene la conexión." },
        { flag: "KILL id", description: "Cierra la conexión entera." }
      ],
      example: { command: "sudo mariadb -e \"SELECT id, user, db, time, state, LEFT(info,120) AS consulta FROM information_schema.processlist WHERE command <> 'Sleep' AND time > 5 ORDER BY time DESC;\"", explanation: "La web va lenta: encuentra la consulta que lleva más tiempo ejecutándose y bloqueando tablas. Cancélala con KILL QUERY solo si sabes qué es." },
      tags: ["mariadb", "consultas", "bloqueo", "lento", "processlist"]
    },
    {
      id: "web-mariadb-slowlog", name: "slow query log + mariadb-dumpslow", os: "linux", shell: "bash", category: "processes", risk: "caution",
      description: "Activa en caliente el registro de consultas lentas y resume las que más tiempo consumen en total.",
      syntax: "SET GLOBAL slow_query_log=1; SET GLOBAL long_query_time=N;  |  mariadb-dumpslow -s t -t 10 log",
      requires: "Nativo (mariadb-server; mariadb-dumpslow equivale a mysqldumpslow). Para que sobreviva al reinicio, añádelo en /etc/mysql/mariadb.conf.d/50-server.cnf.",
      flags: [
        { flag: "long_query_time=1", description: "Registra consultas de más de 1 s." },
        { flag: "log_queries_not_using_indexes", description: "Registra también las que no usan índices." },
        { flag: "-s t -t 10", description: "Top 10 por tiempo total." },
        { flag: "-s c", description: "Ordena por número de ejecuciones." }
      ],
      example: { command: "sudo mariadb -e \"SET GLOBAL slow_query_log=1; SET GLOBAL long_query_time=1;\" && sleep 3600 && sudo mariadb-dumpslow -s t -t 10 /var/lib/mysql/$(hostname)-slow.log", explanation: "Recoge una hora de tráfico real y muestra las 10 consultas que más tiempo de base de datos consumen: candidatas a índice o caché." },
      tags: ["mariadb", "consultas lentas", "slow log", "indices", "optimizacion"]
    },
    {
      id: "web-mysqltuner", name: "mysqltuner", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Analiza la configuración y estadísticas de MariaDB y recomienda ajustes (buffer pool, conexiones, caché de tablas…).",
      syntax: "mysqltuner [--user root] [--forcemem MB]",
      requires: "sudo apt install mysqltuner · Ejecutar con al menos 24 h de actividad para que las recomendaciones sean fiables.",
      flags: [
        { flag: "--forcemem 4096", description: "RAM a considerar si la BD comparte servidor." },
        { flag: "--nocolor", description: "Salida limpia para guardar." },
        { flag: "--verbose", description: "Más detalle." }
      ],
      example: { command: "sudo mysqltuner --nocolor | tee /root/mysqltuner-$(date +%F).txt | grep -A40 'Recommendations'", explanation: "Revisión mensual de MariaDB: guarda el informe y muestra las recomendaciones (normalmente innodb_buffer_pool_size)." },
      tags: ["mariadb", "tuning", "configuracion", "optimizacion", "rendimiento"]
    },
    {
      id: "web-pidstat", name: "pidstat (Apache + MariaDB)", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Mide por intervalos el uso de CPU, RAM y disco de los procesos del servidor web y de la base de datos.",
      syntax: "pidstat [-u] [-r] [-d] -C 'patrón' intervalo [veces]",
      requires: "sudo apt install sysstat",
      flags: [
        { flag: "-u / -r / -d", description: "CPU / memoria / E/S de disco." },
        { flag: "-C 'apache2|mariadbd'", description: "Filtra por nombre de proceso." },
        { flag: "-l", description: "Muestra la línea de comando completa." }
      ],
      example: { command: "pidstat -u -r -d -C 'apache2|mariadbd|php-fpm' 5 12", explanation: "Un minuto de muestreo bajo carga: identifica si quien consume CPU o disco es Apache, PHP-FPM o MariaDB." },
      tags: ["cpu", "memoria", "disco", "procesos", "sysstat"]
    },
    {
      id: "web-iostat", name: "iostat -xz", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Latencia y saturación de cada disco. Clave para saber si MariaDB va lenta por el almacenamiento.",
      syntax: "iostat -xz [-m] intervalo [veces]",
      requires: "sudo apt install sysstat",
      flags: [
        { flag: "-x", description: "Estadísticas extendidas." },
        { flag: "-z", description: "Oculta dispositivos sin actividad." },
        { flag: "r_await / w_await", description: "Latencia media en ms (más de 10–20 ms en SSD es mala)." },
        { flag: "%util", description: "Cerca del 100 % = disco saturado." }
      ],
      example: { command: "iostat -xzm 5 6", explanation: "Si w_await y %util se disparan cuando la web va lenta, el problema es el disco (escrituras de MariaDB o logs), no la CPU." },
      tags: ["disco", "latencia", "io", "rendimiento", "mariadb"]
    },
    {
      id: "web-ab", name: "ab (prueba de carga)", os: "linux", shell: "bash", category: "processes", risk: "caution",
      description: "ApacheBench: lanza N peticiones con C usuarios simultáneos y mide peticiones por segundo y tiempos de respuesta.",
      syntax: "ab -n peticiones -c concurrencia [-k] URL",
      requires: "Paquete apache2-utils (se instala con apache2). Úsalo solo contra tus propios servidores y fuera de horas punta.",
      flags: [
        { flag: "-n 1000", description: "Peticiones totales." },
        { flag: "-c 50", description: "Peticiones simultáneas." },
        { flag: "-k", description: "Usa keep-alive." },
        { flag: "Requests per second", description: "Métrica principal del resultado." }
      ],
      example: { command: "ab -n 2000 -c 50 -k https://staging.tu-dominio.com/ | grep -E 'Requests per second|Time per request|Failed requests|50%|95%|99%'", explanation: "Compara el rendimiento antes y después de un cambio (OPcache, MPM event, caché) con la misma prueba." },
      tags: ["carga", "benchmark", "stress", "rendimiento", "apache"]
    },

    // ---- Seguridad y análisis de logs
    {
      id: "web-log-404", name: "awk (IPs con más errores 404)", os: "linux", shell: "bash", category: "security", risk: "safe",
      description: "Lista las IPs que más errores 404 generan: casi siempre escáneres buscando archivos vulnerables.",
      syntax: "awk '$9 == 404 {print $1}' access.log | sort | uniq -c | sort -nr",
      requires: "Nativo. Log en formato combined.",
      flags: [
        { flag: "$9 == 404", description: "Columna del código HTTP." },
        { flag: "$9 ~ /^5/", description: "Errores de servidor (5xx)." },
        { flag: "zcat -f access.log*", description: "Incluye logs rotados." }
      ],
      example: { command: "zcat -f /var/log/apache2/access.log* | awk '$9 == 404 {print $1}' | sort | uniq -c | sort -nr | awk '$1 > 100' | head -n 20", explanation: "IPs con más de 100 errores 404: candidatas a bloqueo en el firewall o en Fail2ban." },
      tags: ["404", "escaneo", "ip", "logs", "apache"]
    },
    {
      id: "web-log-scans", name: "grep (escaneos de vulnerabilidades)", os: "linux", shell: "bash", category: "security", risk: "safe",
      description: "Detecta en el access.log intentos típicos de explotación: .env, .git, phpMyAdmin, path traversal, inyección SQL o XSS.",
      syntax: "grep -Ei 'patrones' access.log | awk '{print $1}' | sort | uniq -c",
      requires: "Nativo.",
      flags: [
        { flag: "\\.env|/\\.git", description: "Búsqueda de credenciales expuestas." },
        { flag: "\\.\\./|etc/passwd", description: "Path traversal." },
        { flag: "union.*select|sleep\\(", description: "Inyección SQL." },
        { flag: "<script|%3Cscript", description: "XSS." }
      ],
      example: { command: "grep -Ei '\\.env|/\\.git/|phpmyadmin|wp-config|\\.\\./|etc/passwd|union.+select|sleep\\(|<script|%3Cscript|base64_decode' /var/log/apache2/access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head -n 20", explanation: "Ranking de IPs que han lanzado sondas de ataque. Comprueba también con awk '$9==200' si alguna de esas peticiones tuvo éxito." },
      tags: ["ataques", "inyeccion", "sqli", "xss", "escaneo", "seguridad"]
    },
    {
      id: "web-log-bruteforce", name: "awk (fuerza bruta en logins web)", os: "linux", shell: "bash", category: "security", risk: "safe",
      description: "Cuenta los POST contra formularios de login (wp-login.php, xmlrpc.php, /admin) por IP para detectar fuerza bruta.",
      syntax: "awk '$6 ~ /POST/ && $7 ~ /login/ {print $1}' access.log | sort | uniq -c | sort -nr",
      requires: "Nativo.",
      flags: [
        { flag: "$6 ~ /POST/", description: "Método de la petición." },
        { flag: "$7 ~ /wp-login|xmlrpc/", description: "Rutas de login a vigilar (adáptalas a tu aplicación)." },
        { flag: "awk '$1 > 20'", description: "Umbral de intentos." }
      ],
      example: { command: "awk '$6 ~ /POST/ && $7 ~ /wp-login\\.php|xmlrpc\\.php|\\/admin|\\/login/ {print $1}' /var/log/apache2/access.log | sort | uniq -c | sort -nr | awk '$1 > 20' | head", explanation: "IPs con más de 20 intentos de login hoy. Si es WordPress, xmlrpc.php permite cientos de intentos por petición: desactívalo si no lo usas." },
      tags: ["fuerza bruta", "login", "wordpress", "xmlrpc", "ataques"]
    },
    {
      id: "web-log-useragents", name: "awk (user-agents sospechosos)", os: "linux", shell: "bash", category: "security", risk: "safe",
      description: "Agrupa los user-agents y destaca herramientas de ataque conocidas (sqlmap, nikto, nmap, masscan…).",
      syntax: "awk -F'\"' '{print $6}' access.log | sort | uniq -c | sort -nr",
      requires: "Nativo.",
      flags: [
        { flag: "-F'\"'", description: "Separa por comillas: $6 es el user-agent en formato combined." },
        { flag: "grep -Ei 'sqlmap|nikto'", description: "Herramientas de pentesting." },
        { flag: "'^-$'", description: "Peticiones sin user-agent (casi siempre scripts)." }
      ],
      example: { command: "awk -F'\"' '{print $6}' /var/log/apache2/access.log | grep -Ei 'sqlmap|nikto|nmap|masscan|zgrab|nuclei|wpscan|dirbuster|gobuster|python-requests|curl|^-$' | sort | uniq -c | sort -nr", explanation: "Detecta escáneres automáticos que se identifican en el user-agent; combinado con su IP, puedes bloquearlos con Fail2ban." },
      tags: ["user-agent", "bots", "escaneres", "sqlmap", "seguridad"]
    },
    {
      id: "web-log-rpm", name: "awk (peticiones por minuto)", os: "linux", shell: "bash", category: "security", risk: "safe",
      description: "Agrupa las peticiones por minuto para localizar picos de tráfico anómalos (DDoS, scraping) y cuándo empezaron.",
      syntax: "awk '{print substr($4, 2, 17)}' access.log | sort | uniq -c",
      requires: "Nativo.",
      flags: [
        { flag: "substr($4,2,17)", description: "dd/Mmm/aaaa:HH:MM, fecha hasta el minuto." },
        { flag: "substr($4,2,14)", description: "Agrupa por hora." },
        { flag: "sort -nr | head", description: "Los minutos de más tráfico." }
      ],
      example: { command: "awk '{print substr($4, 2, 17)}' /var/log/apache2/access.log | sort | uniq -c | sort -nr | head -n 10", explanation: "Muestra los 10 minutos con más peticiones; después filtra ese minuto con grep para ver qué IPs lo causaron." },
      tags: ["picos", "ddos", "trafico", "minuto", "analisis"]
    },
    {
      id: "web-fail2ban-apache", name: "fail2ban (jails para Apache)", os: "linux", shell: "bash", category: "security", risk: "caution",
      description: "Activa las protecciones de Fail2ban para Apache: autenticación fallida, bots maliciosos, escaneo de scripts y desbordamientos.",
      syntax: "/etc/fail2ban/jail.d/apache.local  →  [apache-auth] enabled = true ...",
      requires: "sudo apt install fail2ban · Incluye ya los filtros apache-*; solo hay que activarlos.",
      flags: [
        { flag: "apache-auth", description: "Fallos de autenticación HTTP Basic/Digest." },
        { flag: "apache-badbots", description: "User-agents de spambots conocidos." },
        { flag: "apache-noscript", description: "Búsqueda de scripts inexistentes (.php, .asp…)." },
        { flag: "apache-overflows", description: "Peticiones anormalmente largas." }
      ],
      example: { command: "sudo tee /etc/fail2ban/jail.d/apache.local >/dev/null <<'EOF'\n[apache-auth]\nenabled = true\n[apache-badbots]\nenabled = true\n[apache-noscript]\nenabled = true\n[apache-overflows]\nenabled = true\nEOF\nsudo fail2ban-client reload && sudo fail2ban-client status", explanation: "Protege Apache con los filtros que ya trae Fail2ban. Añade tu IP de administración a ignoreip en jail.local para no bloquearte." },
      tags: ["fail2ban", "apache", "bloqueo", "bots", "proteccion"]
    },
    {
      id: "web-mariadb-security", name: "Auditoría de seguridad de MariaDB", os: "linux", shell: "bash", category: "security", risk: "safe",
      description: "Comprueba que MariaDB no está expuesta a Internet y que no hay usuarios accesibles desde cualquier host o sin contraseña.",
      syntax: "ss -tlnp 'sport = :3306' && mariadb -e \"SELECT user, host, plugin FROM mysql.user;\"",
      requires: "Nativo. Si aparece 0.0.0.0:3306, revisa bind-address en /etc/mysql/mariadb.conf.d/50-server.cnf.",
      flags: [
        { flag: "127.0.0.1:3306", description: "Correcto: solo escucha en local." },
        { flag: "host = '%'", description: "Usuario accesible desde cualquier IP." },
        { flag: "mariadb-secure-installation", description: "Quita usuarios anónimos y la base de datos de pruebas." }
      ],
      example: { command: "sudo ss -tlnp 'sport = :3306' && sudo mariadb -e \"SELECT user, host, plugin FROM mysql.user WHERE host NOT IN ('localhost','127.0.0.1','::1') OR user = '';\"", explanation: "Si 3306 escucha en todas las interfaces o hay usuarios con host '%', la base de datos está expuesta a ataques de fuerza bruta." },
      tags: ["mariadb", "seguridad", "usuarios", "puerto", "exposicion"]
    },

    // ---- Mantenimiento y automatización
    {
      id: "web-mariadb-backup", name: "mariadb-dump (backup con rotación)", os: "linux", shell: "bash", category: "automation", risk: "caution",
      description: "Copia de seguridad consistente de todas las bases de datos sin bloquear InnoDB, comprimida y con borrado de copias antiguas.",
      syntax: "mariadb-dump --single-transaction --routines --triggers --events --all-databases | gzip > archivo.sql.gz",
      requires: "Nativo (mariadb-client). Guarda una copia fuera del servidor (rsync/rclone).",
      flags: [
        { flag: "--single-transaction", description: "Copia consistente de InnoDB sin bloquear tablas." },
        { flag: "--routines --triggers --events", description: "Incluye procedimientos, triggers y eventos." },
        { flag: "--all-databases / nombre_bd", description: "Todas o una concreta." },
        { flag: "find -mtime +7 -delete", description: "Retención de 7 días." }
      ],
      example: { command: "sudo mariadb-dump --single-transaction --routines --triggers --events --all-databases | gzip > /backups/mariadb-$(date +%F_%H%M).sql.gz && find /backups -name 'mariadb-*.sql.gz' -mtime +7 -delete", explanation: "Backup nocturno listo para cron. Restaurar: gunzip < archivo.sql.gz | sudo mariadb. Prueba la restauración de vez en cuando." },
      tags: ["backup", "mariadb", "mysqldump", "copia", "rotacion"]
    },
    {
      id: "web-cron-flock", name: "cron + flock (tareas sin solapamiento)", os: "linux", shell: "bash", category: "automation", risk: "caution",
      description: "Evita que una tarea programada se ejecute dos veces a la vez si la anterior aún no terminó, y registra su salida.",
      syntax: "m h * * * flock -n /run/lock/tarea.lock comando >> log 2>&1",
      requires: "Nativo (util-linux).",
      flags: [
        { flag: "-n", description: "Si ya está en ejecución, sale sin esperar." },
        { flag: "-w 300", description: "Espera hasta 300 s a que se libere." },
        { flag: ">> log 2>&1", description: "Guarda salida y errores." },
        { flag: "MAILTO=", description: "Variable de crontab para recibir avisos por correo." }
      ],
      example: { command: "30 2 * * * flock -n /run/lock/backup-db.lock /usr/local/bin/backup-db.sh >> /var/log/backup-db.log 2>&1", explanation: "Si un backup tarda más de lo normal, el siguiente no se lanza encima saturando disco y MariaDB." },
      tags: ["cron", "flock", "bloqueo", "solapamiento", "tareas"]
    },
    {
      id: "web-apache-reload", name: "configtest + reload (cambios sin corte)", os: "linux", shell: "bash", category: "automation", risk: "caution",
      description: "Activa módulos o sitios y aplica la configuración de Apache sin cortar las conexiones activas, solo si la sintaxis es válida.",
      syntax: "a2enmod|a2dismod|a2ensite|a2dissite nombre && apache2ctl configtest && systemctl reload apache2",
      requires: "Nativo (apache2).",
      flags: [
        { flag: "a2enmod / a2dismod", description: "Activa / desactiva módulos." },
        { flag: "a2ensite / a2dissite", description: "Activa / desactiva virtual hosts." },
        { flag: "a2enconf", description: "Activa fragmentos de conf-available." },
        { flag: "reload vs restart", description: "reload termina las peticiones en curso; restart las corta." }
      ],
      example: { command: "sudo a2enmod headers expires http2 && sudo apache2ctl configtest && sudo systemctl reload apache2", explanation: "Activa cabeceras de seguridad, caché de estáticos y HTTP/2. Si configtest falla, no se recarga nada y la web sigue funcionando." },
      tags: ["apache", "recargar", "modulos", "vhost", "sin corte"]
    },
    {
      id: "web-logrotate", name: "logrotate -d / -f", os: "linux", shell: "bash", category: "automation", risk: "caution",
      description: "Prueba y fuerza la rotación de logs de Apache para evitar que llenen el disco.",
      syntax: "logrotate -d /etc/logrotate.d/apache2 | logrotate -f /etc/logrotate.d/apache2",
      requires: "Nativo.",
      flags: [
        { flag: "-d", description: "Simulación: muestra qué haría sin hacerlo." },
        { flag: "-f", description: "Fuerza la rotación ahora." },
        { flag: "rotate 14 / daily", description: "Directivas de retención en el archivo." },
        { flag: "compress", description: "Comprime los logs rotados." }
      ],
      example: { command: "sudo logrotate -d /etc/logrotate.d/apache2 2>&1 | tail -n 20 && sudo logrotate -f /etc/logrotate.d/apache2", explanation: "El access.log ocupa varios GB: verifica la configuración en modo simulación y rota inmediatamente." },
      tags: ["logs", "rotar", "espacio", "apache", "mantenimiento"]
    },
    {
      id: "web-certbot", name: "certbot renew --dry-run", os: "linux", shell: "bash", category: "automation", risk: "safe",
      description: "Comprueba que la renovación automática de los certificados Let's Encrypt funcionará antes de que caduquen.",
      syntax: "certbot certificates | certbot renew --dry-run",
      requires: "sudo apt install certbot python3-certbot-apache (o snap install --classic certbot).",
      flags: [
        { flag: "certificates", description: "Certificados y fecha de caducidad." },
        { flag: "renew --dry-run", description: "Simula la renovación contra el entorno de pruebas." },
        { flag: "--apache", description: "Configura el vhost HTTPS automáticamente." }
      ],
      example: { command: "sudo certbot certificates && sudo certbot renew --dry-run && systemctl list-timers | grep -i certbot", explanation: "Confirma caducidades, que la renovación funciona y que el temporizador automático está programado." },
      tags: ["certificado", "letsencrypt", "https", "ssl", "renovacion"]
    },
    {
      id: "web-cleanup", name: "Limpieza de espacio (apt, journal, logs)", os: "linux", shell: "bash", category: "automation", risk: "caution",
      description: "Libera espacio de forma segura: caché de paquetes, kernels antiguos, journal de systemd y logs rotados viejos.",
      syntax: "apt clean && apt autoremove --purge && journalctl --vacuum-time=14d",
      requires: "Nativo.",
      flags: [
        { flag: "apt clean", description: "Vacía la caché de paquetes descargados." },
        { flag: "autoremove --purge", description: "Quita dependencias y kernels antiguos." },
        { flag: "--vacuum-time=14d / --vacuum-size=500M", description: "Recorta el journal por antigüedad / tamaño." },
        { flag: "find ... -mtime +30 -delete", description: "Borra logs rotados de más de 30 días." }
      ],
      example: { command: "df -h / && sudo apt clean && sudo apt autoremove --purge -y && sudo journalctl --vacuum-time=14d && sudo find /var/log/apache2 -name '*.gz' -mtime +30 -delete && df -h /", explanation: "Mantenimiento mensual del disco con medición antes y después. Revisa la política de retención de logs antes de borrar." },
      tags: ["limpieza", "espacio", "cache", "journal", "mantenimiento"]
    },
    {
      id: "web-needrestart", name: "needrestart", os: "linux", shell: "bash", category: "packages", risk: "safe",
      description: "Tras actualizar paquetes, indica qué servicios (Apache, MariaDB, PHP-FPM…) siguen usando librerías antiguas y si hace falta reiniciar el kernel.",
      syntax: "needrestart [-r l|a] [-k] [-b]",
      requires: "Viene instalado en Ubuntu Server 22.04+; si no: sudo apt install needrestart",
      flags: [
        { flag: "-r l", description: "Solo lista, no reinicia nada." },
        { flag: "-k / -l", description: "Solo kernel / solo librerías (sin ellas revisa ambos)." },
        { flag: "-b", description: "Salida para scripts/monitorización." }
      ],
      example: { command: "sudo apt update && sudo apt upgrade -y && sudo needrestart -r l", explanation: "Después de parchear OpenSSL o glibc, Apache y MariaDB siguen con la versión vulnerable en memoria hasta reiniciarlos: needrestart te dice cuáles." },
      tags: ["actualizaciones", "reinicio", "servicios", "kernel", "parches"]
    },

    /* ===================== CONTENEDORES Y KUBERNETES ===================== */
    {
      id: "linux-docker-ps", name: "docker ps / logs / exec", os: "linux", shell: "bash", category: "containers", risk: "safe",
      description: "Lista los contenedores, muestra sus logs y abre una shell dentro de uno en ejecución para diagnosticarlo.",
      syntax: "docker ps [-a] | docker logs [-f] [--since] contenedor | docker exec -it contenedor sh",
      requires: "Docker Engine (sudo apt install docker.io o el repositorio oficial de Docker).",
      flags: [
        { flag: "ps -a", description: "Incluye los contenedores detenidos." },
        { flag: "logs -f --since 10m", description: "Sigue los logs de los últimos 10 minutos." },
        { flag: "exec -it … sh", description: "Shell interactiva dentro del contenedor." },
        { flag: "--format '{{.Names}}\\t{{.Status}}'", description: "Columnas personalizadas." }
      ],
      example: { command: "docker ps -a --format 'table {{.Names}}\\t{{.Status}}\\t{{.Ports}}' && docker logs --since 10m --tail 50 web && docker exec -it web sh", explanation: "Un contenedor se reinicia en bucle: revisa su estado, sus últimos logs y entra a inspeccionarlo por dentro." },
      tags: ["docker", "contenedores", "logs", "shell", "diagnostico"]
    },
    {
      id: "linux-docker-run", name: "docker run", os: "linux", shell: "bash", category: "containers", risk: "caution",
      description: "Crea y arranca un contenedor a partir de una imagen, con puertos, volúmenes, variables y política de reinicio.",
      syntax: "docker run -d --name n [-p host:cont] [-v vol:/ruta] [-e VAR=valor] [--restart unless-stopped] imagen",
      requires: "Docker Engine.",
      flags: [
        { flag: "-d --name", description: "En segundo plano y con nombre fijo." },
        { flag: "-p 8080:80", description: "Publica el puerto 80 del contenedor en el 8080 del host." },
        { flag: "-v datos:/var/lib/mysql", description: "Volumen persistente." },
        { flag: "--restart unless-stopped", description: "Arranca solo tras reiniciar el servidor." }
      ],
      example: { command: "docker run -d --name uptime-kuma --restart unless-stopped -p 127.0.0.1:3001:3001 -v kuma-data:/app/data louislam/uptime-kuma:1", explanation: "Despliega un monitor de servicios escuchando solo en localhost (para publicarlo después tras Apache/Nginx con HTTPS)." },
      tags: ["docker", "contenedor", "desplegar", "puertos", "volumenes"]
    },
    {
      id: "linux-docker-compose", name: "docker compose", os: "linux", shell: "bash", category: "containers", risk: "caution",
      description: "Gestiona aplicaciones de varios contenedores definidas en compose.yaml: arrancar, actualizar, ver logs y parar.",
      syntax: "docker compose [-f compose.yaml] up -d | pull | logs -f | ps | down",
      requires: "Plugin docker compose v2 (incluido en Docker Engine moderno).",
      flags: [
        { flag: "up -d", description: "Crea o actualiza los servicios en segundo plano." },
        { flag: "pull", description: "Descarga las versiones nuevas de las imágenes." },
        { flag: "logs -f servicio", description: "Logs en directo de un servicio." },
        { flag: "down -v", description: "Para y BORRA también los volúmenes (¡datos!)." }
      ],
      example: { command: "cd /opt/stack && docker compose pull && docker compose up -d && docker compose ps && docker image prune -f", explanation: "Actualiza una pila a las últimas imágenes con un corte mínimo y limpia las imágenes antiguas." },
      tags: ["docker", "compose", "stack", "actualizar", "servicios"]
    },
    {
      id: "linux-docker-prune", name: "docker system df / prune", os: "linux", shell: "bash", category: "containers", risk: "danger",
      description: "Muestra cuánto disco ocupan imágenes, contenedores y volúmenes, y libera espacio borrando lo que no se usa.",
      syntax: "docker system df | docker system prune [-a] [--volumes] [-f]",
      requires: "Docker Engine.",
      flags: [
        { flag: "system df -v", description: "Uso de disco detallado." },
        { flag: "prune", description: "Borra contenedores parados, redes y capas huérfanas." },
        { flag: "-a", description: "Borra también imágenes sin contenedor asociado." },
        { flag: "--volumes", description: "Borra volúmenes sin usar: ¡puede eliminar datos!" }
      ],
      example: { command: "docker system df && docker system prune -a -f --filter 'until=168h'", explanation: "/var/lib/docker ha llenado el disco: borra imágenes y restos de más de 7 días sin tocar los volúmenes de datos." },
      tags: ["docker", "espacio", "limpieza", "disco", "imagenes"]
    },
    {
      id: "linux-docker-stats", name: "docker stats / inspect", os: "linux", shell: "bash", category: "containers", risk: "safe",
      description: "Consumo de CPU, memoria y red de cada contenedor en tiempo real, y su configuración completa en JSON.",
      syntax: "docker stats [--no-stream] | docker inspect [-f plantilla] contenedor",
      requires: "Docker Engine.",
      flags: [
        { flag: "--no-stream", description: "Una sola lectura (para scripts)." },
        { flag: "inspect -f '{{.State.Health.Status}}'", description: "Extrae un campo concreto." },
        { flag: "inspect … .NetworkSettings", description: "IPs y redes del contenedor." }
      ],
      example: { command: "docker stats --no-stream --format 'table {{.Name}}\\t{{.CPUPerc}}\\t{{.MemUsage}}' && docker inspect -f '{{.Name}} {{.State.Status}} reinicios={{.RestartCount}}' $(docker ps -aq)", explanation: "Qué contenedor consume más y cuáles se están reiniciando solos." },
      tags: ["docker", "rendimiento", "memoria", "cpu", "inspeccionar"]
    },
    {
      id: "linux-podman", name: "podman / podman generate systemd", os: "linux", shell: "bash", category: "containers", risk: "caution",
      description: "Motor de contenedores sin demonio y compatible con la sintaxis de Docker; puede ejecutarse sin root y crear servicios systemd.",
      syntax: "podman run|ps|logs ... (igual que docker) | podman generate systemd --new --name contenedor",
      requires: "sudo apt install podman (incluido por defecto en RHEL/Alma/Rocky).",
      flags: [
        { flag: "alias docker=podman", description: "La mayoría de comandos son idénticos." },
        { flag: "--userns=keep-id", description: "Contenedores sin root con tu UID." },
        { flag: "generate systemd --new", description: "Genera una unidad systemd para el contenedor." },
        { flag: "Quadlet (.container)", description: "Alternativa moderna en Podman 4.4+." }
      ],
      example: { command: "podman generate systemd --new --name web --files && mv container-web.service ~/.config/systemd/user/ && systemctl --user enable --now container-web.service && loginctl enable-linger $USER", explanation: "Convierte un contenedor sin root en un servicio que arranca solo con el sistema, sin necesidad de un demonio Docker." },
      tags: ["podman", "contenedores", "rootless", "systemd", "rhel"]
    },
    {
      id: "linux-kubectl-get", name: "kubectl get / describe", os: "linux", shell: "bash", category: "containers", risk: "safe",
      description: "Lista recursos del clúster (pods, servicios, nodos…) y muestra el detalle y los eventos de uno concreto.",
      syntax: "kubectl get recurso [-n ns|-A] [-o wide|yaml] | kubectl describe recurso nombre",
      requires: "kubectl configurado con acceso al clúster (~/.kube/config).",
      flags: [
        { flag: "-A", description: "Todos los namespaces." },
        { flag: "-o wide", description: "Más columnas: nodo, IP." },
        { flag: "--field-selector status.phase!=Running", description: "Filtra pods que no están en marcha." },
        { flag: "describe pod", description: "Eventos: ImagePullBackOff, OOMKilled, scheduling…" }
      ],
      example: { command: "kubectl get pods -A --field-selector status.phase!=Running && kubectl describe pod -n produccion api-7d9f8c6b5-x2k4p | tail -n 25", explanation: "Localiza los pods con problemas en todo el clúster y lee sus eventos para ver la causa." },
      tags: ["kubernetes", "k8s", "pods", "cluster", "diagnostico"]
    },
    {
      id: "linux-kubectl-logs", name: "kubectl logs / exec", os: "linux", shell: "bash", category: "containers", risk: "safe",
      description: "Lee los logs de un pod (incluido el contenedor anterior si se reinició) y ejecuta comandos dentro de él.",
      syntax: "kubectl logs [-f] [--previous] [-c contenedor] pod | kubectl exec -it pod -- sh",
      requires: "kubectl configurado.",
      flags: [
        { flag: "--previous", description: "Logs del contenedor que murió (CrashLoopBackOff)." },
        { flag: "-l app=api", description: "Logs de todos los pods con esa etiqueta." },
        { flag: "--since=15m --tail=100", description: "Limita por tiempo y líneas." },
        { flag: "exec -it … -- sh", description: "Shell dentro del pod." }
      ],
      example: { command: "kubectl logs -n produccion deploy/api --previous --tail=100", explanation: "Un pod está en CrashLoopBackOff: ve por qué falló el arranque anterior." },
      tags: ["kubernetes", "logs", "crashloop", "pods", "exec"]
    },
    {
      id: "linux-kubectl-rollout", name: "kubectl rollout / scale", os: "linux", shell: "bash", category: "containers", risk: "caution",
      description: "Reinicia, escala o revierte un Deployment, y sigue el estado del despliegue.",
      syntax: "kubectl rollout restart|status|undo deploy/nombre | kubectl scale deploy/nombre --replicas=N",
      requires: "kubectl configurado con permisos sobre el namespace.",
      flags: [
        { flag: "rollout restart", description: "Recrea los pods de forma escalonada." },
        { flag: "rollout status", description: "Espera a que termine el despliegue." },
        { flag: "rollout undo", description: "Vuelve a la versión anterior." },
        { flag: "scale --replicas=0", description: "Detiene la aplicación (sin borrarla)." }
      ],
      example: { command: "kubectl -n produccion rollout undo deploy/api && kubectl -n produccion rollout status deploy/api --timeout=120s", explanation: "La versión recién desplegada da errores: vuelve a la anterior y confirma que los pods arrancan bien." },
      tags: ["kubernetes", "despliegue", "rollback", "escalar", "reiniciar"]
    },
    {
      id: "linux-kubectl-top", name: "kubectl top", os: "linux", shell: "bash", category: "containers", risk: "safe",
      description: "Consumo de CPU y memoria de nodos y pods del clúster.",
      syntax: "kubectl top nodes | kubectl top pods [-A] [--sort-by=memory|cpu]",
      requires: "metrics-server instalado en el clúster.",
      flags: [
        { flag: "top nodes", description: "Carga de cada nodo." },
        { flag: "--sort-by=memory", description: "Ordena los pods por memoria." },
        { flag: "--containers", description: "Desglose por contenedor." }
      ],
      example: { command: "kubectl top nodes && kubectl top pods -A --sort-by=memory | head -n 15", explanation: "Un nodo va al límite: identifica qué pods consumen más memoria antes de que el OOM killer actúe." },
      tags: ["kubernetes", "rendimiento", "memoria", "cpu", "nodos"]
    },
    {
      id: "linux-kubectl-drain", name: "kubectl cordon / drain", os: "linux", shell: "bash", category: "containers", risk: "danger",
      description: "Saca un nodo del clúster para mantenimiento: impide nuevos pods y desaloja los existentes a otros nodos.",
      syntax: "kubectl cordon nodo | kubectl drain nodo --ignore-daemonsets --delete-emptydir-data | kubectl uncordon nodo",
      requires: "kubectl con permisos de administrador del clúster.",
      flags: [
        { flag: "cordon", description: "No se programan pods nuevos en el nodo." },
        { flag: "drain --ignore-daemonsets", description: "Desaloja los pods respetando los PodDisruptionBudgets." },
        { flag: "--delete-emptydir-data", description: "Acepta perder datos temporales emptyDir." },
        { flag: "uncordon", description: "Devuelve el nodo al servicio." }
      ],
      example: { command: "kubectl drain k8s-worker-02 --ignore-daemonsets --delete-emptydir-data --timeout=10m && echo 'Parchear y reiniciar el nodo' && kubectl uncordon k8s-worker-02", explanation: "Mantenimiento de un nodo sin cortar el servicio: los pods se mueven a otros nodos antes de reiniciarlo." },
      tags: ["kubernetes", "mantenimiento", "nodo", "drain", "parches"]
    },

    /* ===================== GIT ===================== */
    {
      id: "linux-git-status", name: "git status / log / diff", os: "linux", shell: "bash", category: "git", risk: "safe",
      description: "Estado del repositorio, historial resumido y diferencias pendientes: lo primero antes de tocar una configuración versionada.",
      syntax: "git status [-sb] | git log --oneline --graph [-n N] | git diff [--staged] [archivo]",
      requires: "sudo apt install git (en Windows: Git for Windows; los comandos son iguales en PowerShell).",
      flags: [
        { flag: "status -sb", description: "Estado compacto con la rama." },
        { flag: "log --oneline --graph --all", description: "Historial en árbol." },
        { flag: "diff --staged", description: "Lo que va a entrar en el próximo commit." },
        { flag: "log -p -- archivo", description: "Historial de cambios de un archivo." }
      ],
      example: { command: "cd /etc/ansible && git status -sb && git log --oneline --graph -n 10 && git diff", explanation: "Antes de desplegar, revisa qué ha cambiado en el repositorio de configuración y quién hizo los últimos cambios." },
      tags: ["git", "historial", "cambios", "diff", "repositorio"]
    },
    {
      id: "linux-git-commit", name: "git add / commit / push", os: "linux", shell: "bash", category: "git", risk: "caution",
      description: "Registra cambios en el historial y los sube al repositorio remoto.",
      syntax: "git add archivo|-p | git commit -m 'mensaje' | git push [origin rama]",
      requires: "git; credenciales o clave SSH para el remoto.",
      flags: [
        { flag: "add -p", description: "Elige por fragmentos qué cambios incluir." },
        { flag: "commit -m", description: "Mensaje en línea." },
        { flag: "commit --amend", description: "Corrige el último commit (no si ya está subido)." },
        { flag: "push -u origin rama", description: "Primera subida de una rama nueva." }
      ],
      example: { command: "git switch -c fix/apache-headers && git add -p apache/security.conf && git commit -m 'Apache: añade cabeceras HSTS y X-Content-Type-Options' && git push -u origin fix/apache-headers", explanation: "Trabaja cada cambio de infraestructura en su propia rama para revisarlo en un pull request antes de aplicarlo." },
      tags: ["git", "commit", "push", "rama", "subir"]
    },
    {
      id: "linux-git-pull", name: "git fetch / pull --rebase", os: "linux", shell: "bash", category: "git", risk: "caution",
      description: "Trae los cambios del remoto y los integra en tu rama manteniendo un historial lineal.",
      syntax: "git fetch [--prune] | git pull --rebase [origin rama]",
      requires: "git.",
      flags: [
        { flag: "fetch --prune", description: "Descarga cambios y limpia ramas remotas borradas." },
        { flag: "pull --rebase", description: "Reaplica tus commits encima de los del remoto." },
        { flag: "--autostash", description: "Guarda y restaura cambios sin confirmar." },
        { flag: "status tras fetch", description: "Indica si vas por delante o por detrás." }
      ],
      example: { command: "git fetch --prune && git status -sb && git pull --rebase --autostash", explanation: "Actualiza tu copia del repositorio de scripts sin crear commits de merge innecesarios." },
      tags: ["git", "actualizar", "pull", "rebase", "sincronizar"]
    },
    {
      id: "linux-git-stash", name: "git stash / restore", os: "linux", shell: "bash", category: "git", risk: "caution",
      description: "Aparta cambios a medias para cambiar de tarea, o descarta cambios locales de un archivo.",
      syntax: "git stash [push -m msg] | git stash list|pop | git restore [--staged] archivo",
      requires: "git.",
      flags: [
        { flag: "stash push -m", description: "Guarda los cambios con descripción." },
        { flag: "stash pop", description: "Recupera el último stash." },
        { flag: "restore archivo", description: "Descarta cambios locales (irreversible)." },
        { flag: "restore --staged", description: "Saca un archivo del área de preparación." }
      ],
      example: { command: "git stash push -m 'pruebas vhost' && git switch main && git pull --rebase && git switch - && git stash pop", explanation: "Una urgencia en main mientras estabas a medias: apartas tu trabajo, actualizas y vuelves a recuperarlo." },
      tags: ["git", "stash", "descartar", "cambios", "deshacer"]
    },
    {
      id: "linux-git-revert", name: "git revert / reset", os: "linux", shell: "bash", category: "git", risk: "danger",
      description: "Deshace commits: revert crea un commit inverso (seguro); reset --hard reescribe la rama y borra cambios locales.",
      syntax: "git revert commit | git reset [--soft|--hard] commit",
      requires: "git.",
      flags: [
        { flag: "revert", description: "Deshace un commit ya publicado de forma segura." },
        { flag: "reset --soft HEAD~1", description: "Deshace el último commit conservando los cambios." },
        { flag: "reset --hard", description: "Descarta commits y cambios locales. Irreversible." },
        { flag: "reflog", description: "Recupera commits «perdidos» tras un reset." }
      ],
      example: { command: "git log --oneline -n 5 && git revert --no-edit a1b2c3d && git push", explanation: "Un cambio de firewall publicado ha roto el acceso: lo deshaces con un commit nuevo sin reescribir el historial compartido." },
      tags: ["git", "deshacer", "revert", "reset", "rollback"]
    },
    {
      id: "linux-git-blame", name: "git blame / log -S", os: "linux", shell: "bash", category: "git", risk: "safe",
      description: "Averigua quién y en qué commit cambió cada línea de un archivo, o cuándo apareció un texto concreto.",
      syntax: "git blame [-L inicio,fin] archivo | git log -S 'texto' [--oneline]",
      requires: "git.",
      flags: [
        { flag: "blame -L 10,30", description: "Solo un rango de líneas." },
        { flag: "log -S 'cadena'", description: "Commits que añadieron o quitaron ese texto." },
        { flag: "show commit", description: "Detalle completo de un commit." }
      ],
      example: { command: "git log -S 'PermitRootLogin yes' --oneline -- ssh/sshd_config && git blame -L '/PermitRootLogin/,+1' ssh/sshd_config", explanation: "Auditoría: descubre cuándo y quién habilitó el login de root por SSH en la configuración versionada." },
      tags: ["git", "auditoria", "blame", "historial", "quien"]
    },

    // ---- Bash scripting (automatización)
    {
      id: "linux-bash-strict", name: "set -euo pipefail", os: "linux", shell: "bash", category: "automation", risk: "safe",
      description: "Modo estricto para scripts Bash: aborta ante errores, variables sin definir y fallos dentro de tuberías.",
      syntax: "#!/usr/bin/env bash\nset -euo pipefail",
      requires: "Nativo (Bash).",
      flags: [
        { flag: "-e", description: "Sale si un comando falla." },
        { flag: "-u", description: "Error si se usa una variable sin definir." },
        { flag: "-o pipefail", description: "Una tubería falla si falla cualquiera de sus comandos." },
        { flag: "trap '…' ERR", description: "Ejecuta algo al producirse un error." }
      ],
      example: { command: "#!/usr/bin/env bash\nset -euo pipefail\ntrap 'echo \"Error en la línea $LINENO\" >&2' ERR\nBACKUP_DIR=\"${1:?Uso: $0 <directorio_destino>}\"\nmariadb-dump --single-transaction --all-databases | gzip > \"$BACKUP_DIR/db-$(date +%F).sql.gz\"", explanation: "Plantilla de script de backup que nunca sigue adelante tras un fallo silencioso y avisa de la línea exacta del error." },
      tags: ["bash", "scripting", "errores", "plantilla", "robusto"]
    },
    {
      id: "linux-bash-loop", name: "bucles while read / for", os: "linux", shell: "bash", category: "automation", risk: "caution",
      description: "Recorre listas de servidores, usuarios o archivos línea a línea de forma segura (con espacios y caracteres raros).",
      syntax: "while IFS= read -r linea; do …; done < archivo | for x in lista; do …; done",
      requires: "Nativo (Bash).",
      flags: [
        { flag: "IFS= read -r", description: "Lee la línea completa, sin interpretar barras invertidas." },
        { flag: "< archivo", description: "Entrada del bucle." },
        { flag: "ssh -n", description: "Evita que ssh se coma la entrada del bucle." },
        { flag: "[[ -z $l || $l == \\#* ]] && continue", description: "Salta líneas vacías y comentarios." }
      ],
      example: { command: "while IFS= read -r host; do [[ -z $host || $host == \\#* ]] && continue; printf '%-20s %s\\n' \"$host\" \"$(ssh -n -o ConnectTimeout=5 \"$host\" 'uptime -p' 2>&1)\"; done < servidores.txt", explanation: "Recorre un inventario de servidores (ignorando comentarios) y muestra cuánto tiempo lleva encendido cada uno." },
      tags: ["bash", "bucle", "scripting", "inventario", "masivo"]
    },
    {
      id: "linux-bash-functions", name: "funciones, getopts y códigos de salida", os: "linux", shell: "bash", category: "automation", risk: "safe",
      description: "Estructura scripts reutilizables con funciones, parámetros con opciones (-h, -v…) y códigos de salida para la monitorización.",
      syntax: "funcion() { …; return N; } | while getopts 'hv:' opt; do case $opt in …; esac; done",
      requires: "Nativo (Bash).",
      flags: [
        { flag: "local var", description: "Variables locales a la función." },
        { flag: "getopts 'hu:'", description: "Opciones -h y -u con argumento." },
        { flag: "exit 0/1/2", description: "OK / aviso / crítico (convención Nagios/Zabbix)." },
        { flag: "$?", description: "Código de salida del último comando." }
      ],
      example: { command: "check_disk() { local uso; uso=$(df --output=pcent \"$1\" | tail -1 | tr -dc '0-9'); if (( uso >= 90 )); then echo \"CRÍTICO $1 ${uso}%\"; return 2; elif (( uso >= 80 )); then echo \"AVISO $1 ${uso}%\"; return 1; fi; echo \"OK $1 ${uso}%\"; }; check_disk /; echo \"código: $?\"", explanation: "Comprobación de disco con la convención de códigos de salida de Nagios/Zabbix, lista para usarla como check personalizado." },
      tags: ["bash", "funciones", "getopts", "monitorizacion", "nagios"]
    },
    {
      id: "linux-bash-parallel", name: "xargs -P / wait (paralelismo)", os: "linux", shell: "bash", category: "automation", risk: "caution",
      description: "Ejecuta tareas en paralelo desde Bash: trabajos en segundo plano con wait, o un número limitado de procesos con xargs -P.",
      syntax: "comando & … wait | printf '%s\\n' lista | xargs -P N -I{} comando {}",
      requires: "Nativo (Bash, xargs).",
      flags: [
        { flag: "&", description: "Lanza en segundo plano." },
        { flag: "wait", description: "Espera a que terminen todos." },
        { flag: "xargs -P 10", description: "Como máximo 10 a la vez." },
        { flag: "parallel", description: "GNU parallel: más opciones (sudo apt install parallel)." }
      ],
      example: { command: "xargs -a servidores.txt -P 10 -I{} sh -c 'rsync -az /opt/scripts/ {}:/opt/scripts/ && echo \"OK {}\" || echo \"FALLO {}\"'", explanation: "Distribuye los scripts de administración a todos los servidores, 10 a la vez, indicando cuáles fallan." },
      tags: ["bash", "paralelo", "xargs", "rapido", "masivo"]
    },

    /* ===================== VIRTUALIZACIÓN ===================== */
    {
      id: "win-hyperv-vm", name: "Get-VM / Start-VM / Stop-VM", os: "windows", shell: "powershell", category: "virtualization", risk: "caution",
      description: "Gestiona máquinas virtuales de Hyper-V: estado, encendido, apagado ordenado y recursos asignados.",
      syntax: "Get-VM [-ComputerName host] | Start-VM -Name vm | Stop-VM -Name vm [-Force|-TurnOff]",
      requires: "Rol Hyper-V con el módulo de PowerShell (Install-WindowsFeature Hyper-V-PowerShell).",
      flags: [
        { flag: "-ComputerName", description: "Gestiona un host Hyper-V remoto." },
        { flag: "Stop-VM", description: "Apagado ordenado desde el sistema invitado." },
        { flag: "-TurnOff", description: "Equivale a desenchufar (posible pérdida de datos)." },
        { flag: "Set-VM -MemoryStartupBytes", description: "Cambia la memoria asignada." }
      ],
      example: { command: "Get-VM -ComputerName hv01 | Select-Object Name, State, CPUUsage, @{n='RAM GB';e={[math]::Round($_.MemoryAssigned/1GB,1)}}, Uptime | Sort-Object State", explanation: "Inventario rápido de las VMs de un host: cuáles están encendidas y cuánta memoria consume cada una." },
      tags: ["hyper-v", "vm", "maquinas virtuales", "virtualizacion"]
    },
    {
      id: "win-hyperv-checkpoint", name: "Checkpoint-VM", os: "windows", shell: "powershell", category: "virtualization", risk: "caution",
      description: "Crea, lista, restaura y elimina puntos de control (snapshots) de VMs de Hyper-V.",
      syntax: "Checkpoint-VM -Name vm -SnapshotName nombre | Get-VMSnapshot | Restore-VMSnapshot | Remove-VMSnapshot",
      requires: "Módulo Hyper-V.",
      flags: [
        { flag: "-SnapshotName", description: "Nombre descriptivo del punto de control." },
        { flag: "Restore-VMSnapshot", description: "Vuelve al estado guardado (se pierde lo posterior)." },
        { flag: "Remove-VMSnapshot", description: "Fusiona y elimina el punto de control." },
        { flag: "Set-VM -CheckpointType Production", description: "Puntos de control coherentes con VSS." }
      ],
      example: { command: "Checkpoint-VM -Name srv01 -SnapshotName \"Antes de parches $(Get-Date -Format yyyy-MM-dd)\"; Get-VMSnapshot -VMName srv01 | Select-Object Name, CreationTime", explanation: "Punto de control antes de parchear. Elimínalo al terminar: los checkpoints antiguos degradan el rendimiento y llenan el disco." },
      tags: ["hyper-v", "snapshot", "checkpoint", "parches", "rollback"]
    },
    {
      id: "win-hyperv-replication", name: "Get-VMReplication / Measure-VM", os: "windows", shell: "powershell", category: "virtualization", risk: "safe",
      description: "Estado de la réplica de Hyper-V y consumo de recursos de las VMs para la planificación de capacidad.",
      syntax: "Get-VMReplication [-VMName] | Measure-VMReplication | Enable-VMResourceMetering; Measure-VM",
      requires: "Módulo Hyper-V; réplica configurada para Get-VMReplication.",
      flags: [
        { flag: "Health", description: "Normal / Warning / Critical." },
        { flag: "Measure-VMReplication", description: "Último ciclo de réplica y tamaño." },
        { flag: "Enable-VMResourceMetering", description: "Activa la medición de CPU, RAM, disco y red." }
      ],
      example: { command: "Get-VMReplication | Where-Object Health -ne 'Normal' | Select-Object VMName, State, Health, PrimaryServer, ReplicaServer", explanation: "Revisión diaria del plan de recuperación ante desastres: VMs cuya réplica tiene avisos o errores." },
      tags: ["hyper-v", "replica", "dr", "capacidad", "salud"]
    },
    {
      id: "win-powercli-connect", name: "Connect-VIServer / Get-VM (PowerCLI)", os: "windows", shell: "powershell", category: "virtualization", risk: "safe",
      description: "Conecta con vCenter o ESXi mediante VMware PowerCLI y consulta las VMs y su estado.",
      syntax: "Connect-VIServer -Server vcenter | Get-VM [nombre] | Get-VMHost",
      requires: "Install-Module VMware.PowerCLI -Scope CurrentUser (PowerShell 7 recomendado).",
      flags: [
        { flag: "-Server vcenter.corp.local", description: "vCenter o host ESXi." },
        { flag: "Get-VMHost", description: "Hosts ESXi, estado y versión." },
        { flag: "Get-Datastore", description: "Espacio en los almacenes de datos." },
        { flag: "Disconnect-VIServer -Confirm:$false", description: "Cierra la sesión." }
      ],
      example: { command: "Connect-VIServer -Server vcenter.corp.local; Get-VM | Where-Object PowerState -eq 'PoweredOn' | Select-Object Name, NumCpu, MemoryGB, @{n='SO';e={$_.Guest.OSFullName}} | Sort-Object MemoryGB -Descending | Select-Object -First 15", explanation: "Las 15 VMs encendidas que más memoria tienen asignada: punto de partida para recuperar recursos." },
      tags: ["vmware", "powercli", "vcenter", "esxi", "vm"]
    },
    {
      id: "win-powercli-snapshots", name: "Get-Snapshot (PowerCLI)", os: "windows", shell: "powershell", category: "virtualization", risk: "caution",
      description: "Localiza y elimina snapshots antiguos de VMware, causa habitual de lentitud y de datastores llenos.",
      syntax: "Get-VM | Get-Snapshot | Where-Object Created -lt fecha | Remove-Snapshot",
      requires: "VMware.PowerCLI y sesión con Connect-VIServer.",
      flags: [
        { flag: "SizeGB", description: "Espacio que ocupa el snapshot." },
        { flag: "Created", description: "Fecha de creación." },
        { flag: "Remove-Snapshot -RunAsync", description: "Consolida en segundo plano." },
        { flag: "-WhatIf", description: "Simula el borrado." }
      ],
      example: { command: "Get-VM | Get-Snapshot | Where-Object Created -lt (Get-Date).AddDays(-7) | Select-Object VM, Name, Created, @{n='GB';e={[math]::Round($_.SizeGB,1)}} | Sort-Object GB -Descending", explanation: "Informe de snapshots de más de una semana: candidatos a eliminar (añade | Remove-Snapshot -WhatIf para simularlo)." },
      tags: ["vmware", "snapshot", "datastore", "espacio", "powercli"]
    },
    {
      id: "linux-virsh", name: "virsh (KVM / libvirt)", os: "linux", shell: "bash", category: "virtualization", risk: "caution",
      description: "Gestiona máquinas virtuales KVM desde la terminal: listar, arrancar, apagar, consola y snapshots.",
      syntax: "virsh list [--all] | start|shutdown|destroy vm | console vm | snapshot-create-as vm nombre",
      requires: "sudo apt install qemu-kvm libvirt-daemon-system libvirt-clients",
      flags: [
        { flag: "list --all", description: "Todas las VMs, también apagadas." },
        { flag: "shutdown / destroy", description: "Apagado ordenado / forzado." },
        { flag: "autostart vm", description: "Arranca la VM con el host." },
        { flag: "dominfo / domblklist", description: "Recursos y discos de la VM." }
      ],
      example: { command: "virsh list --all && virsh snapshot-create-as srv01 antes-actualizacion --disk-only --atomic && virsh shutdown srv01", explanation: "Snapshot de disco consistente de una VM KVM antes de una intervención y apagado ordenado." },
      tags: ["kvm", "libvirt", "virsh", "vm", "virtualizacion"]
    },

    /* ===================== EXCHANGE Y MICROSOFT 365 ===================== */
    {
      id: "win-connect-exo", name: "Connect-ExchangeOnline", os: "windows", shell: "powershell", category: "m365", risk: "safe",
      description: "Conecta con Exchange Online para administrar buzones, permisos y reglas de correo desde PowerShell.",
      syntax: "Connect-ExchangeOnline -UserPrincipalName admin@dominio | Disconnect-ExchangeOnline",
      requires: "Install-Module ExchangeOnlineManagement -Scope CurrentUser",
      flags: [
        { flag: "-UserPrincipalName", description: "Cuenta de administración (con MFA)." },
        { flag: "-ShowBanner:$false", description: "Oculta el mensaje de bienvenida." },
        { flag: "Get-EXOMailbox", description: "Versión rápida de Get-Mailbox (REST)." },
        { flag: "Disconnect-ExchangeOnline -Confirm:$false", description: "Cierra la sesión." }
      ],
      example: { command: "Connect-ExchangeOnline -UserPrincipalName admin@empresa.com -ShowBanner:$false; Get-EXOMailbox -ResultSize Unlimited | Group-Object RecipientTypeDetails | Select-Object Name, Count", explanation: "Inventario de buzones por tipo (usuario, compartido, sala…) al hacerte cargo de un tenant." },
      tags: ["exchange", "office 365", "m365", "correo", "conectar"]
    },
    {
      id: "win-mailboxpermission", name: "Add-MailboxPermission", os: "windows", shell: "powershell", category: "m365", risk: "caution",
      description: "Da acceso completo o permiso «enviar como» sobre un buzón (por ejemplo, un buzón compartido).",
      syntax: "Add-MailboxPermission -Identity buzón -User usuario -AccessRights FullAccess [-AutoMapping $false]",
      requires: "ExchangeOnlineManagement conectado (o Exchange Management Shell en local).",
      flags: [
        { flag: "-AccessRights FullAccess", description: "Abrir y gestionar el buzón." },
        { flag: "-AutoMapping $false", description: "No lo añade automáticamente a Outlook." },
        { flag: "Add-RecipientPermission -AccessRights SendAs", description: "Enviar como el buzón." },
        { flag: "Get-MailboxPermission", description: "Revisa quién tiene acceso." }
      ],
      example: { command: "Add-MailboxPermission -Identity soporte@empresa.com -User jlopez@empresa.com -AccessRights FullAccess -AutoMapping $true; Add-RecipientPermission -Identity soporte@empresa.com -Trustee jlopez@empresa.com -AccessRights SendAs -Confirm:$false", explanation: "Alta de un técnico en el buzón compartido de soporte con permiso para leer y responder como soporte@." },
      tags: ["exchange", "buzon compartido", "permisos", "sendas", "m365"]
    },
    {
      id: "win-message-trace", name: "Get-MessageTraceV2", os: "windows", shell: "powershell", category: "m365", risk: "safe",
      description: "Rastrea un correo en Exchange Online: si llegó, si se entregó, si fue a cuarentena o se rechazó.",
      syntax: "Get-MessageTraceV2 [-SenderAddress] [-RecipientAddress] [-StartDate] [-EndDate]",
      requires: "ExchangeOnlineManagement 3.7+ conectado (en versiones anteriores: Get-MessageTrace).",
      flags: [
        { flag: "-SenderAddress / -RecipientAddress", description: "Filtra por remitente o destinatario." },
        { flag: "-StartDate (Get-Date).AddDays(-2)", description: "Ventana de búsqueda (máx. 10 días)." },
        { flag: "Status", description: "Delivered, FilteredAsSpam, Quarantined, Failed…" },
        { flag: "Get-MessageTraceDetailV2", description: "Pasos detallados de un mensaje." }
      ],
      example: { command: "Get-MessageTraceV2 -RecipientAddress jlopez@empresa.com -SenderAddress facturas@proveedor.com -StartDate (Get-Date).AddDays(-3) -EndDate (Get-Date) | Select-Object Received, Subject, Status", explanation: "«No me ha llegado la factura»: comprueba si el correo entró, se entregó o acabó en cuarentena." },
      tags: ["exchange", "rastreo", "correo", "cuarentena", "spam"]
    },
    {
      id: "win-mailbox-forwarding", name: "Set-Mailbox (reenvío / respuesta automática)", os: "windows", shell: "powershell", category: "m365", risk: "caution",
      description: "Configura reenvíos y respuestas automáticas de un buzón; útil en bajas y vacaciones, y para auditar reenvíos sospechosos.",
      syntax: "Set-Mailbox -Identity u -ForwardingSmtpAddress dir -DeliverToMailboxAndForward $true | Set-MailboxAutoReplyConfiguration",
      requires: "ExchangeOnlineManagement conectado.",
      flags: [
        { flag: "-ForwardingSmtpAddress", description: "Dirección a la que reenviar." },
        { flag: "-DeliverToMailboxAndForward $true", description: "Conserva también una copia en el buzón." },
        { flag: "Set-MailboxAutoReplyConfiguration -AutoReplyState Enabled", description: "Respuesta automática." },
        { flag: "Get-Mailbox | Where ForwardingSmtpAddress", description: "Audita reenvíos externos." }
      ],
      example: { command: "Get-EXOMailbox -ResultSize Unlimited -Properties ForwardingSmtpAddress, ForwardingAddress | Where-Object { $_.ForwardingSmtpAddress -or $_.ForwardingAddress } | Select-Object UserPrincipalName, ForwardingSmtpAddress, ForwardingAddress", explanation: "Auditoría de seguridad: los reenvíos ocultos a direcciones externas son un indicio clásico de cuenta comprometida." },
      tags: ["exchange", "reenvio", "vacaciones", "seguridad", "auditoria"]
    },
    {
      id: "win-mggraph-users", name: "Connect-MgGraph / Get-MgUser", os: "windows", shell: "powershell", category: "m365", risk: "safe",
      description: "Microsoft Graph PowerShell: consulta usuarios, licencias y actividad de inicio de sesión en Entra ID (Azure AD).",
      syntax: "Connect-MgGraph -Scopes 'User.Read.All' | Get-MgUser [-All] [-Property ...] [-Filter ...]",
      requires: "Install-Module Microsoft.Graph -Scope CurrentUser (sustituye a los módulos MSOnline y AzureAD, retirados).",
      flags: [
        { flag: "-Scopes", description: "Permisos que solicita la sesión." },
        { flag: "-All -Property", description: "Todos los usuarios con las propiedades indicadas." },
        { flag: "signInActivity", description: "Último inicio de sesión (requiere AuditLog.Read.All)." },
        { flag: "Get-MgSubscribedSku", description: "Licencias contratadas y usadas." }
      ],
      example: { command: "Connect-MgGraph -Scopes 'User.Read.All','AuditLog.Read.All' -NoWelcome; Get-MgUser -All -Property DisplayName,UserPrincipalName,AccountEnabled,SignInActivity | Where-Object { $_.AccountEnabled -and $_.SignInActivity.LastSignInDateTime -lt (Get-Date).AddDays(-90) } | Select-Object DisplayName, UserPrincipalName, @{n='Último acceso';e={$_.SignInActivity.LastSignInDateTime}}", explanation: "Cuentas activas sin iniciar sesión en 90 días: licencias que se pueden recuperar y riesgo de seguridad." },
      tags: ["graph", "entra id", "azure ad", "usuarios", "licencias"]
    },
    {
      id: "win-mg-license", name: "Set-MgUserLicense", os: "windows", shell: "powershell", category: "m365", risk: "caution",
      description: "Asigna o retira licencias de Microsoft 365 a usuarios mediante Microsoft Graph.",
      syntax: "Set-MgUserLicense -UserId upn -AddLicenses @(@{SkuId=id}) -RemoveLicenses @()",
      requires: "Microsoft.Graph conectado con el ámbito User.ReadWrite.All; el usuario debe tener UsageLocation.",
      flags: [
        { flag: "Get-MgSubscribedSku", description: "SkuId y licencias disponibles." },
        { flag: "-AddLicenses", description: "Licencias que se añaden." },
        { flag: "-RemoveLicenses", description: "SkuId de las licencias que se quitan." },
        { flag: "Update-MgUser -UsageLocation ES", description: "País obligatorio antes de licenciar." }
      ],
      example: { command: "$sku = Get-MgSubscribedSku | Where-Object SkuPartNumber -eq 'O365_BUSINESS_PREMIUM'; Update-MgUser -UserId jlopez@empresa.com -UsageLocation ES; Set-MgUserLicense -UserId jlopez@empresa.com -AddLicenses @(@{SkuId = $sku.SkuId}) -RemoveLicenses @()", explanation: "Alta de licencia Microsoft 365 Business Standard a un usuario nuevo (con el país configurado, que es obligatorio)." },
      tags: ["licencias", "m365", "graph", "alta", "office"]
    },

    /* ===================== EQUIPOS DE RED (CISCO / MIKROTIK) ===================== */
    {
      id: "net-cisco-show-int", name: "show ip interface brief / show interfaces", os: "network", shell: "ios", category: "netdevices", risk: "safe",
      description: "Cisco IOS: estado de todas las interfaces (IP, up/down) y contadores de errores de un puerto.",
      syntax: "show ip interface brief | show interfaces Gi1/0/1 | show interfaces status",
      requires: "Acceso por SSH/consola a un equipo Cisco IOS/IOS-XE (modo privilegiado para algunos comandos).",
      flags: [
        { flag: "show ip interface brief", description: "Resumen de IPs y estado." },
        { flag: "show interfaces status", description: "Puertos de switch: VLAN, dúplex, velocidad." },
        { flag: "| include errors|CRC", description: "Filtra la salida (como grep)." },
        { flag: "show interfaces counters errors", description: "Errores por puerto." }
      ],
      example: { command: "show interfaces GigabitEthernet1/0/24 | include line protocol|errors|CRC|duplex", explanation: "Un usuario se queja de lentitud: comprueba si su puerto tiene errores CRC o negociación de dúplex incorrecta (cable o tarjeta defectuosos)." },
      tags: ["cisco", "ios", "interfaces", "switch", "errores"]
    },
    {
      id: "net-cisco-show-run", name: "show running-config / copy run start", os: "network", shell: "ios", category: "netdevices", risk: "caution",
      description: "Cisco IOS: muestra la configuración activa y la guarda en la memoria de arranque para que sobreviva a un reinicio.",
      syntax: "show running-config [| section texto] | copy running-config startup-config | write memory",
      requires: "Modo privilegiado (enable).",
      flags: [
        { flag: "| section interface", description: "Solo un bloque de la configuración." },
        { flag: "show startup-config", description: "Configuración guardada." },
        { flag: "copy run start", description: "Guarda los cambios (si no, se pierden al reiniciar)." },
        { flag: "copy run tftp:", description: "Copia de seguridad a un servidor TFTP." }
      ],
      example: { command: "show running-config | section interface GigabitEthernet1/0/24\ncopy running-config startup-config", explanation: "Revisa la configuración de un puerto tras modificarlo y guárdala. Olvidar el copy run start es el error más típico en Cisco." },
      tags: ["cisco", "configuracion", "guardar", "backup", "ios"]
    },
    {
      id: "net-cisco-vlan", name: "switchport access vlan", os: "network", shell: "ios", category: "netdevices", risk: "caution",
      description: "Cisco IOS: asigna un puerto de switch a una VLAN de acceso y lo describe.",
      syntax: "configure terminal → interface Gi1/0/N → switchport mode access → switchport access vlan N",
      requires: "Modo de configuración (configure terminal) en un switch Cisco.",
      flags: [
        { flag: "show vlan brief", description: "VLANs y puertos asignados." },
        { flag: "switchport mode access", description: "Puerto de acceso (no troncal)." },
        { flag: "spanning-tree portfast", description: "Arranque rápido para equipos finales." },
        { flag: "description", description: "Documenta el puerto." }
      ],
      example: { command: "configure terminal\ninterface GigabitEthernet1/0/24\n description PC-Contabilidad-03\n switchport mode access\n switchport access vlan 30\n spanning-tree portfast\nend\nshow vlan brief | include 30", explanation: "Mueve un puesto a la VLAN de contabilidad y comprueba la asignación." },
      tags: ["cisco", "vlan", "switch", "puerto", "acceso"]
    },
    {
      id: "net-cisco-mac", name: "show mac address-table / show cdp neighbors", os: "network", shell: "ios", category: "netdevices", risk: "safe",
      description: "Cisco IOS: localiza en qué puerto está conectado un equipo por su MAC y qué dispositivos Cisco hay al lado.",
      syntax: "show mac address-table address xxxx.xxxx.xxxx | show cdp neighbors [detail]",
      requires: "Acceso a un switch Cisco.",
      flags: [
        { flag: "address 0011.2233.4455", description: "Busca una MAC concreta (formato Cisco)." },
        { flag: "interface Gi1/0/24", description: "MACs aprendidas en un puerto." },
        { flag: "show cdp neighbors detail", description: "Vecinos: modelo, IP y puerto remoto." },
        { flag: "show lldp neighbors", description: "Equivalente estándar multimarca." }
      ],
      example: { command: "show mac address-table address 3c52.82a1.9f07\nshow cdp neighbors GigabitEthernet1/0/48 detail", explanation: "Encuentra la boca exacta de una impresora por su MAC; si sale por un enlace troncal, CDP te dice a qué switch saltar." },
      tags: ["cisco", "mac", "localizar", "cdp", "lldp"]
    },
    {
      id: "net-cisco-logging", name: "show logging / show version", os: "network", shell: "ios", category: "netdevices", risk: "safe",
      description: "Cisco IOS: registro de eventos del equipo (caídas de enlaces, errores) y versión de firmware, tiempo encendido y motivo del último reinicio.",
      syntax: "show logging [| include texto] | show version",
      requires: "Acceso a un equipo Cisco IOS.",
      flags: [
        { flag: "| include LINK|UPDOWN", description: "Caídas de enlaces." },
        { flag: "show version | include uptime|reason", description: "Tiempo encendido y causa del último reinicio." },
        { flag: "show environment", description: "Temperatura, ventiladores y fuentes." }
      ],
      example: { command: "show version | include uptime|System returned|reason\nshow logging | include UPDOWN", explanation: "Tras un corte de red, averigua si el switch se reinició (y por qué) o si un enlace estuvo cayendo." },
      tags: ["cisco", "logs", "version", "reinicio", "eventos"]
    },
    {
      id: "net-mikrotik-print", name: "/interface print / /ip address print", os: "network", shell: "routeros", category: "netdevices", risk: "safe",
      description: "MikroTik RouterOS: estado de interfaces, direcciones IP y tráfico en tiempo real.",
      syntax: "/interface print [stats] | /ip address print | /interface monitor-traffic ether1",
      requires: "Acceso por SSH, Winbox o terminal a un router MikroTik (RouterOS 7).",
      flags: [
        { flag: "print stats", description: "Contadores de tráfico y errores." },
        { flag: "where running=no", description: "Filtra interfaces caídas." },
        { flag: "monitor-traffic ether1", description: "Tráfico en tiempo real." },
        { flag: "/ip route print", description: "Tabla de rutas." }
      ],
      example: { command: "/interface print where running=no\n/ip address print\n/interface monitor-traffic ether1 once", explanation: "Comprobación rápida de un router de sede: enlaces caídos, IPs configuradas y tráfico actual de la WAN." },
      tags: ["mikrotik", "routeros", "interfaces", "router", "ip"]
    },
    {
      id: "net-mikrotik-firewall", name: "/ip firewall filter", os: "network", shell: "routeros", category: "netdevices", risk: "danger",
      description: "MikroTik RouterOS: consulta y añade reglas de firewall. Una regla mal colocada puede dejarte sin acceso al router.",
      syntax: "/ip firewall filter print | add chain=input ... action=accept|drop place-before=N",
      requires: "Acceso de administrador a RouterOS. Usa el modo seguro (Ctrl+X) antes de tocar el firewall.",
      flags: [
        { flag: "chain=input", description: "Tráfico dirigido al propio router." },
        { flag: "src-address-list=", description: "Usa una lista de direcciones." },
        { flag: "place-before=0", description: "Coloca la regla la primera." },
        { flag: "Ctrl+X (safe mode)", description: "Revierte los cambios si pierdes la conexión." }
      ],
      example: { command: "/ip firewall address-list add list=admin address=192.168.10.0/24\n/ip firewall filter add chain=input src-address-list=admin protocol=tcp dst-port=22,8291 action=accept place-before=0 comment=\"Gestion solo desde red admin\"", explanation: "Limita SSH y Winbox a la red de administración. Activa el modo seguro antes por si te bloqueas." },
      tags: ["mikrotik", "firewall", "seguridad", "winbox", "reglas"]
    },
    {
      id: "net-mikrotik-backup", name: "/export / /system backup", os: "network", shell: "routeros", category: "netdevices", risk: "safe",
      description: "MikroTik RouterOS: exporta la configuración en texto legible y crea una copia de seguridad binaria completa.",
      syntax: "/export [show-sensitive] file=nombre | /system backup save name=nombre",
      requires: "Acceso de administrador a RouterOS.",
      flags: [
        { flag: "/export file=", description: "Configuración en texto (.rsc), comparable con diff." },
        { flag: "show-sensitive", description: "Incluye contraseñas y claves (RouterOS 7)." },
        { flag: "/system backup save", description: "Backup binario completo (mismo modelo)." },
        { flag: "/file print", description: "Lista los archivos generados." }
      ],
      example: { command: "/export file=cfg-sede-madrid\n/system backup save name=backup-sede-madrid\n/file print where name~\"sede-madrid\"", explanation: "Copia de seguridad antes de un cambio: el .rsc sirve para revisar y versionar; el .backup para restaurar en el mismo equipo." },
      tags: ["mikrotik", "backup", "exportar", "configuracion", "routeros"]
    },
    {
      id: "net-mikrotik-tools", name: "/ping / /tool torch", os: "network", shell: "routeros", category: "netdevices", risk: "safe",
      description: "MikroTik RouterOS: ping desde el router y «torch», que muestra en tiempo real qué IPs y puertos consumen el ancho de banda.",
      syntax: "/ping dirección [count=N] [src-address=IP] | /tool torch interface=ether1 [src-address=0.0.0.0/0]",
      requires: "Acceso a RouterOS.",
      flags: [
        { flag: "/ping count=5", description: "Ping con número de paquetes." },
        { flag: "src-address=", description: "Prueba desde una IP concreta (VPN, VLAN)." },
        { flag: "/tool torch interface=", description: "Tráfico por IP y protocolo." },
        { flag: "/tool traceroute", description: "Traceroute desde el router." }
      ],
      example: { command: "/tool torch interface=ether1 src-address=0.0.0.0/0 port=any", explanation: "«Internet va lento en la oficina»: descubre en directo qué equipo está saturando la conexión." },
      tags: ["mikrotik", "torch", "ancho de banda", "ping", "diagnostico"]
    },

    /* ===================== AMPLIACIÓN · WINDOWS (v1.3) ===================== */

    // ---- Usuarios y permisos
    {
      id: "win-get-acl", name: "Get-Acl / Set-Acl", os: "windows", shell: "powershell", category: "users", risk: "caution",
      description: "Lee y modifica permisos NTFS (y de claves del Registro) como objetos de PowerShell: ideal para auditar o copiar permisos entre carpetas.",
      syntax: "Get-Acl -Path <ruta> | Format-List | Set-Acl -Path <destino> -AclObject <acl>",
      flags: [
        { flag: "(Get-Acl ruta).Access", description: "Lista de entradas: identidad, derechos y herencia." },
        { flag: "Get-Acl origen | Set-Acl destino", description: "Copia los permisos de una carpeta a otra." },
        { flag: "AddAccessRule()", description: "Añade una regla nueva al objeto ACL." },
        { flag: "SetAccessRuleProtection($true,$true)", description: "Corta la herencia conservando los permisos actuales." }
      ],
      example: { command: "Get-ChildItem D:\\Shares -Directory | ForEach-Object { (Get-Acl $_.FullName).Access | Where-Object IdentityReference -like '*Everyone*' | Select-Object @{n='Carpeta';e={$_.FullName}}, IdentityReference, FileSystemRights }", explanation: "Auditoría rápida: carpetas compartidas donde «Everyone» tiene algún permiso." },
      tags: ["permisos", "ntfs", "acl", "auditoria", "copiar permisos"]
    },
    {
      id: "win-cmdkey", name: "cmdkey", os: "windows", shell: "cmd", category: "users", risk: "caution",
      description: "Gestiona las credenciales guardadas en el Administrador de credenciales de Windows (RDP, recursos compartidos, servidores).",
      syntax: "cmdkey /list | /add:destino /user:usuario /pass | /generic:destino | /delete:destino",
      flags: [
        { flag: "/list", description: "Muestra las credenciales guardadas." },
        { flag: "/add:servidor /user:u /pass", description: "Guarda una credencial de dominio (pide la contraseña)." },
        { flag: "/generic:TERMSRV/host", description: "Credencial para Escritorio remoto." },
        { flag: "/delete:destino", description: "Elimina una credencial (p. ej. tras cambiar la contraseña)." }
      ],
      example: { command: "cmdkey /list | findstr /i \"Target\" && cmdkey /delete:srv01", explanation: "Tras cambiar tu contraseña de dominio, borra la credencial antigua guardada para srv01, que provocaba bloqueos de cuenta." },
      tags: ["credenciales", "contraseñas", "rdp", "bloqueo", "credential manager"]
    },
    {
      id: "win-quser", name: "quser / logoff", os: "windows", shell: "cmd", category: "users", risk: "caution",
      description: "Lista las sesiones de usuario (locales o de Escritorio remoto) de un servidor y cierra las que se hayan quedado colgadas.",
      syntax: "quser [/server:host] | logoff <IdSesión> [/server:host]",
      flags: [
        { flag: "/server:host", description: "Consulta un servidor remoto." },
        { flag: "ESTADO Disc", description: "Sesión desconectada que sigue consumiendo recursos." },
        { flag: "logoff ID", description: "Cierra la sesión (se pierde el trabajo no guardado)." },
        { flag: "query session", description: "Alternativa con más detalle." }
      ],
      example: { command: "quser /server:srv01 && logoff 3 /server:srv01", explanation: "«No puedo entrar por RDP, hay demasiados usuarios»: ve quién tiene sesión en srv01 y cierra la desconectada que ocupa la licencia." },
      tags: ["sesiones", "rdp", "escritorio remoto", "usuarios conectados", "cerrar sesion"]
    },

    // ---- Archivos
    {
      id: "win-select-string", name: "Select-String", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "El «grep» de PowerShell: busca texto o expresiones regulares en archivos o en la salida de otros comandos.",
      syntax: "Select-String -Path <archivos> -Pattern <regex> [-Context n] [-SimpleMatch] [-CaseSensitive]",
      flags: [
        { flag: "-Pattern", description: "Expresión regular a buscar." },
        { flag: "-SimpleMatch", description: "Texto literal (sin regex)." },
        { flag: "-Context 2,2", description: "Líneas antes y después de cada coincidencia." },
        { flag: "-Recurse (con Get-ChildItem)", description: "Busca en subcarpetas." }
      ],
      example: { command: "Get-ChildItem C:\\inetpub\\wwwroot -Recurse -Include *.config | Select-String -Pattern 'password\\s*=' | Select-Object Path, LineNumber, Line", explanation: "Busca contraseñas en texto plano en los web.config de IIS antes de una auditoría." },
      tags: ["buscar", "grep", "texto", "regex", "findstr"]
    },
    {
      id: "win-forfiles", name: "forfiles", os: "windows", shell: "cmd", category: "filesystem", risk: "danger",
      description: "Ejecuta un comando sobre los archivos que cumplen un criterio de fecha: el clásico para borrar logs o copias antiguas desde CMD.",
      syntax: "forfiles /P ruta /S /M patrón /D -días /C \"cmd /c comando @path\"",
      flags: [
        { flag: "/P ruta /S", description: "Carpeta inicial y subcarpetas." },
        { flag: "/M *.log", description: "Patrón de archivos." },
        { flag: "/D -30", description: "Modificados hace más de 30 días." },
        { flag: "/C \"cmd /c echo @path\"", description: "Comando a ejecutar; prueba primero con echo." }
      ],
      example: { command: "forfiles /P \"D:\\Backups\\SQL\" /S /M *.bak /D -14 /C \"cmd /c del /q @path\"", explanation: "Borra copias de SQL Server de más de 14 días. Cambia «del /q» por «echo» para revisar antes qué se borraría." },
      tags: ["borrar", "antiguos", "limpieza", "logs", "retencion"]
    },
    {
      id: "win-fsutil", name: "fsutil", os: "windows", shell: "cmd", category: "storage", risk: "caution",
      description: "Utilidad avanzada del sistema de archivos: espacio libre real, bit de «volumen sucio», archivos de prueba y comportamiento NTFS.",
      syntax: "fsutil volume diskfree C: | fsutil dirty query C: | fsutil file createnew archivo tamaño",
      flags: [
        { flag: "volume diskfree C:", description: "Bytes totales y libres del volumen." },
        { flag: "dirty query C:", description: "Indica si Windows ejecutará chkdsk al arrancar." },
        { flag: "file createnew f 1073741824", description: "Crea un archivo de 1 GB (pruebas de cuota o copia)." },
        { flag: "behavior query disablelastaccess", description: "Si NTFS actualiza la fecha de último acceso." }
      ],
      example: { command: "fsutil dirty query D: && fsutil volume diskfree D:", explanation: "Tras un apagado brusco, comprueba si el volumen de datos quedó marcado como dañado y cuánto espacio libre tiene." },
      tags: ["ntfs", "espacio", "dirty", "chkdsk", "archivo de prueba"]
    },
    {
      id: "win-net-use", name: "net use / New-SmbMapping", os: "windows", shell: "cmd", category: "network", risk: "caution",
      description: "Conecta, lista y desconecta unidades de red y recursos compartidos SMB.",
      syntax: "net use [X:] \\\\servidor\\recurso [/user:dominio\\u] [/persistent:yes] | net use X: /delete",
      flags: [
        { flag: "net use", description: "Lista las conexiones actuales y su estado." },
        { flag: "/persistent:yes", description: "Reconecta la unidad al iniciar sesión." },
        { flag: "/delete", description: "Desconecta (usa * para todas)." },
        { flag: "New-SmbMapping -LocalPath X: -RemotePath", description: "Equivalente en PowerShell." }
      ],
      example: { command: "net use * /delete /y && net use Z: \\\\srv01\\Departamentos /persistent:yes", explanation: "Una unidad de red sale como «No disponible» tras un cambio de servidor: limpia todas las conexiones y vuelve a mapearla." },
      tags: ["unidad de red", "mapear", "smb", "recurso compartido", "carpeta compartida"]
    },

    // ---- Redes
    {
      id: "win-netstat", name: "netstat -ano / -b", os: "windows", shell: "cmd", category: "network", risk: "safe",
      description: "Clásico de CMD: conexiones y puertos en escucha con el PID (o el ejecutable) que los usa.",
      syntax: "netstat -ano [-p tcp] | netstat -b | netstat -s",
      flags: [
        { flag: "-a -n -o", description: "Todas las conexiones, numéricas, con PID." },
        { flag: "-b", description: "Nombre del ejecutable (requiere admin)." },
        { flag: "-s", description: "Estadísticas por protocolo (errores, retransmisiones)." },
        { flag: "| findstr :443", description: "Filtra por puerto." }
      ],
      example: { command: "netstat -ano | findstr \":80 \" | findstr LISTENING && tasklist /FI \"PID eq 4\"", explanation: "IIS no arranca porque el puerto 80 está ocupado: localiza el PID que lo tiene (el 4 es el propio sistema, típico de http.sys o WebDAV)." },
      tags: ["puertos", "conexiones", "pid", "listen", "ocupado"]
    },
    {
      id: "win-test-connection", name: "Test-Connection", os: "windows", shell: "powershell", category: "network", risk: "safe",
      description: "Ping de PowerShell que devuelve objetos: ideal para comprobar muchos equipos a la vez o usarlo en scripts.",
      syntax: "Test-Connection -TargetName <host[]> [-Count n] [-Quiet] [-Repeat] [-TcpPort p]",
      flags: [
        { flag: "-Quiet", description: "Solo True/False." },
        { flag: "-Count 2", description: "Número de pings." },
        { flag: "-Repeat", description: "Ping continuo (como ping -t), PowerShell 7." },
        { flag: "-TcpPort 3389", description: "Prueba un puerto TCP en vez de ICMP (PowerShell 7)." }
      ],
      example: { command: "'srv01','srv02','dc01','web01' | ForEach-Object { [pscustomobject]@{ Equipo = $_; Responde = Test-Connection $_ -Count 1 -Quiet } }", explanation: "Tras un corte eléctrico, tabla rápida de qué servidores han vuelto a responder." },
      tags: ["ping", "conectividad", "icmp", "equipos", "disponibilidad"]
    },
    {
      id: "win-dnsclientcache", name: "Get-DnsClientCache / Clear-DnsClientCache", os: "windows", shell: "powershell", category: "network", risk: "safe",
      description: "Muestra y vacía la caché DNS del cliente desde PowerShell, también en equipos remotos.",
      syntax: "Get-DnsClientCache [-Entry nombre] | Clear-DnsClientCache [-CimSession equipo]",
      flags: [
        { flag: "-Entry", description: "Filtra por nombre." },
        { flag: "Data / TimeToLive", description: "IP resuelta y segundos que le quedan en caché." },
        { flag: "-CimSession", description: "Actúa sobre otro equipo." },
        { flag: "ipconfig /flushdns", description: "Equivalente clásico." }
      ],
      example: { command: "Get-DnsClientCache -Entry intranet.corp.local | Select-Object Entry, Data, TimeToLive; Clear-DnsClientCache -CimSession pc-contab-03", explanation: "Tras cambiar la IP de la intranet, comprueba qué IP tiene cacheada un puesto y vacía su caché en remoto." },
      tags: ["dns", "cache", "flushdns", "resolucion", "remoto"]
    },
    {
      id: "win-invoke-webrequest", name: "Invoke-WebRequest / Invoke-RestMethod", os: "windows", shell: "powershell", category: "network", risk: "safe",
      description: "Cliente HTTP de PowerShell: comprueba webs y APIs, descarga archivos y convierte respuestas JSON en objetos.",
      syntax: "Invoke-WebRequest -Uri <url> [-UseBasicParsing] [-OutFile f] | Invoke-RestMethod -Uri <url> [-Method] [-Body] [-Headers]",
      flags: [
        { flag: "StatusCode / Headers", description: "Código HTTP y cabeceras de la respuesta." },
        { flag: "-OutFile", description: "Descarga a un archivo." },
        { flag: "Invoke-RestMethod", description: "Devuelve el JSON ya convertido en objetos." },
        { flag: "-SkipCertificateCheck", description: "Ignora errores de certificado (solo pruebas, PS 7)." }
      ],
      example: { command: "$r = Invoke-WebRequest -Uri https://app.empresa.com/health -UseBasicParsing -TimeoutSec 10; \"$($r.StatusCode) $($r.Headers['Server'])\"", explanation: "Comprueba desde un servidor Windows interno que la aplicación responde y qué servidor web la sirve." },
      tags: ["http", "api", "rest", "descargar", "curl"]
    },
    {
      id: "win-netsh-portproxy", name: "netsh interface portproxy", os: "windows", shell: "cmd", category: "network", risk: "caution",
      description: "Redirige un puerto local a otra IP y puerto (reenvío TCP), sin instalar nada. Útil para migraciones o para exponer un servicio de WSL.",
      syntax: "netsh interface portproxy add v4tov4 listenport=P listenaddress=IP connectport=P connectaddress=IP",
      flags: [
        { flag: "add v4tov4", description: "Crea una redirección IPv4 → IPv4." },
        { flag: "show all", description: "Lista las redirecciones activas." },
        { flag: "delete v4tov4 listenport=…", description: "Elimina una redirección." },
        { flag: "Servicio iphlpsvc", description: "Debe estar en marcha para que funcione." }
      ],
      example: { command: "netsh interface portproxy add v4tov4 listenport=1433 listenaddress=0.0.0.0 connectport=1433 connectaddress=10.0.0.60 && netsh interface portproxy show all", explanation: "Durante la migración de SQL Server, el servidor antiguo reenvía las conexiones al nuevo mientras se actualizan las cadenas de conexión. Abre el puerto en el firewall." },
      tags: ["redireccion", "port forwarding", "migracion", "wsl", "tcp"]
    },
    {
      id: "win-netsh-wlan", name: "netsh wlan show profiles", os: "windows", shell: "cmd", category: "network", risk: "caution",
      description: "Lista las redes Wi-Fi guardadas, muestra su configuración (incluida la clave) y genera un informe de diagnóstico inalámbrico.",
      syntax: "netsh wlan show profiles | show profile name=\"red\" key=clear | show wlanreport",
      flags: [
        { flag: "show profiles", description: "Redes Wi-Fi guardadas en el equipo." },
        { flag: "key=clear", description: "Muestra la contraseña en claro (requiere admin)." },
        { flag: "show wlanreport", description: "Informe HTML de conexiones y desconexiones de los últimos días." },
        { flag: "delete profile name=", description: "Olvida una red guardada." }
      ],
      example: { command: "netsh wlan show wlanreport && start %ProgramData%\\Microsoft\\Windows\\WlanReport\\wlan-report-latest.html", explanation: "Un portátil pierde la Wi-Fi a menudo: genera el informe de los últimos 3 días con cada desconexión y su motivo." },
      tags: ["wifi", "inalambrico", "clave", "desconexiones", "informe"]
    },

    // ---- Procesos y sistema
    {
      id: "win-cim-hardware", name: "Get-CimInstance (inventario de hardware)", os: "windows", shell: "powershell", category: "processes", risk: "safe",
      description: "Consulta WMI/CIM para inventariar hardware: número de serie, modelo, BIOS, CPU, RAM y discos, también en remoto.",
      syntax: "Get-CimInstance -ClassName Win32_<Clase> [-ComputerName equipo] [-Filter …]",
      flags: [
        { flag: "Win32_BIOS", description: "Número de serie y versión de BIOS." },
        { flag: "Win32_ComputerSystem", description: "Fabricante, modelo y RAM total." },
        { flag: "Win32_Processor / Win32_DiskDrive", description: "CPU y discos físicos." },
        { flag: "-ComputerName", description: "Equipos remotos (WinRM)." }
      ],
      example: { command: "Get-CimInstance Win32_BIOS -ComputerName pc-contab-03 | Select-Object PSComputerName, Manufacturer, SerialNumber; Get-CimInstance Win32_ComputerSystem -ComputerName pc-contab-03 | Select-Object Model, @{n='RAM GB';e={[math]::Round($_.TotalPhysicalMemory/1GB)}}", explanation: "Número de serie y modelo de un portátil para abrir una garantía sin desplazarte hasta el usuario." },
      tags: ["inventario", "hardware", "numero de serie", "wmi", "bios"]
    },
    {
      id: "win-reg", name: "reg query / reg add", os: "windows", shell: "cmd", category: "processes", risk: "caution",
      description: "Consulta, crea, exporta y elimina claves y valores del Registro de Windows desde la línea de comandos.",
      syntax: "reg query clave [/v valor] [/s] | reg add clave /v valor /t tipo /d datos [/f] | reg export clave archivo.reg",
      flags: [
        { flag: "/v nombre", description: "Valor concreto." },
        { flag: "/t REG_DWORD /d 1", description: "Tipo y datos del valor." },
        { flag: "/f", description: "Sin pedir confirmación." },
        { flag: "reg export … .reg", description: "Copia de seguridad antes de cambiar nada." }
      ],
      example: { command: "reg export \"HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\" C:\\Temp\\rdp-backup.reg && reg add \"HKLM\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\" /v fDenyTSConnections /t REG_DWORD /d 0 /f", explanation: "Habilita Escritorio remoto en un servidor, guardando antes una copia de la clave. Abre también el puerto 3389 en el firewall." },
      tags: ["registro", "regedit", "clave", "configuracion", "rdp"]
    },
    {
      id: "win-sc", name: "sc.exe", os: "windows", shell: "cmd", category: "processes", risk: "caution",
      description: "Configuración avanzada de servicios: tipo de inicio, cuenta, acciones ante fallos, dependencias y borrado de servicios huérfanos.",
      syntax: "sc.exe [\\\\equipo] query|qc|config|failure|delete servicio [opciones]",
      flags: [
        { flag: "qc servicio", description: "Configuración: ejecutable, inicio, cuenta, dependencias." },
        { flag: "config servicio start= delayed-auto", description: "Inicio automático retrasado (ojo al espacio tras «=»)." },
        { flag: "failure … actions= restart/60000", description: "Reinicia el servicio si se cae." },
        { flag: "delete servicio", description: "Elimina el servicio (restos de software desinstalado)." }
      ],
      example: { command: "sc.exe failure Spooler reset= 86400 actions= restart/60000/restart/60000/\"\"/0 && sc.exe qfailure Spooler", explanation: "Hace que la cola de impresión se reinicie sola dos veces si se cae, en lugar de esperar a que alguien llame." },
      tags: ["servicios", "reinicio automatico", "fallos", "inicio retrasado", "eliminar servicio"]
    },
    {
      id: "win-powercfg", name: "powercfg", os: "windows", shell: "cmd", category: "processes", risk: "safe",
      description: "Energía: informe de batería y de consumo, qué impide la suspensión y qué despertó al equipo.",
      syntax: "powercfg /batteryreport | /energy | /requests | /lastwake | /setactive esquema",
      flags: [
        { flag: "/batteryreport", description: "Informe HTML con capacidad de diseño frente a capacidad actual." },
        { flag: "/requests", description: "Procesos o drivers que impiden suspender o apagar la pantalla." },
        { flag: "/lastwake", description: "Qué despertó al equipo la última vez." },
        { flag: "/energy", description: "Diagnóstico de eficiencia energética de 60 s." }
      ],
      example: { command: "powercfg /batteryreport /output C:\\Temp\\bateria.html && start C:\\Temp\\bateria.html", explanation: "Un usuario dice que la batería dura poco: compara la capacidad de diseño con la actual para justificar el cambio." },
      tags: ["bateria", "energia", "suspension", "portatil", "informe"]
    },
    {
      id: "win-wevtutil", name: "wevtutil", os: "windows", shell: "cmd", category: "security", risk: "caution",
      description: "Gestiona registros de eventos desde CMD: consulta, exporta para análisis forense, cambia el tamaño máximo o vacía un registro.",
      syntax: "wevtutil el | qe registro [/q:consulta] [/c:n] [/f:text] | epl registro archivo.evtx | sl registro /ms:bytes | cl registro",
      flags: [
        { flag: "qe Security /c:5 /rd:true /f:text", description: "Últimos 5 eventos en texto." },
        { flag: "epl registro archivo.evtx", description: "Exporta el registro (evidencia, análisis offline)." },
        { flag: "sl Security /ms:1073741824", description: "Amplía el tamaño máximo a 1 GB." },
        { flag: "cl registro", description: "Vacía el registro (genera evento 1102 en Security)." }
      ],
      example: { command: "wevtutil epl Security C:\\Evidencias\\%COMPUTERNAME%-Security.evtx && wevtutil sl Security /ms:1073741824", explanation: "Ante un incidente, conserva el registro de seguridad completo y amplía su tamaño para no perder eventos nuevos." },
      tags: ["eventos", "logs", "exportar", "forense", "tamaño registro"]
    },

    // ---- Seguridad
    {
      id: "win-authenticode", name: "Get-AuthenticodeSignature", os: "windows", shell: "powershell", category: "security", risk: "safe",
      description: "Comprueba la firma digital de ejecutables, scripts y drivers: si está firmado, por quién y si la firma es válida.",
      syntax: "Get-AuthenticodeSignature -FilePath <archivo>",
      flags: [
        { flag: "Status", description: "Valid, NotSigned, HashMismatch…" },
        { flag: "SignerCertificate.Subject", description: "Quién firmó el archivo." },
        { flag: "Set-AuthenticodeSignature", description: "Firma tus propios scripts con un certificado de firma de código." }
      ],
      example: { command: "Get-ChildItem C:\\Users\\*\\AppData\\Roaming -Recurse -Include *.exe -ErrorAction SilentlyContinue | Get-AuthenticodeSignature | Where-Object Status -ne 'Valid' | Select-Object Path, Status", explanation: "Caza de amenazas: ejecutables sin firma válida en AppData, una ubicación típica de malware." },
      tags: ["firma", "authenticode", "malware", "ejecutables", "integridad"]
    },
    {
      id: "win-klist", name: "klist", os: "windows", shell: "cmd", category: "security", risk: "caution",
      description: "Muestra y purga los tickets Kerberos de la sesión: útil cuando un cambio de grupo no se aplica o falla la autenticación.",
      syntax: "klist [tickets | tgt | purge] [-lh 0 -li 0x3e7]",
      flags: [
        { flag: "klist", description: "Tickets de servicio de la sesión actual." },
        { flag: "klist tgt", description: "Ticket principal (TGT) y su caducidad." },
        { flag: "klist purge", description: "Borra los tickets: se piden de nuevo con los grupos actuales." },
        { flag: "-li 0x3e7 purge", description: "Purga los tickets de la cuenta de equipo (SYSTEM)." }
      ],
      example: { command: "klist purge && gpupdate /force && whoami /groups | findstr /i \"GG_Finanzas\"", explanation: "Acabas de añadir a un usuario a un grupo: purga sus tickets para que el nuevo permiso funcione sin cerrar sesión." },
      tags: ["kerberos", "tickets", "grupos", "autenticacion", "purge"]
    },
    {
      id: "win-cert-expiring", name: "Get-ChildItem Cert:\\ (certificados)", os: "windows", shell: "powershell", category: "security", risk: "safe",
      description: "Recorre el almacén de certificados de Windows como si fuera una unidad: localiza certificados caducados o a punto de caducar.",
      syntax: "Get-ChildItem Cert:\\LocalMachine\\My [-ExpiringInDays n] | certutil -store My",
      flags: [
        { flag: "Cert:\\LocalMachine\\My", description: "Certificados personales del equipo (IIS, RDP…)." },
        { flag: "-ExpiringInDays 30", description: "Solo los que caducan en 30 días." },
        { flag: "Thumbprint", description: "Huella para enlazarlos en IIS o scripts." },
        { flag: "certutil -store My", description: "Alternativa en CMD." }
      ],
      example: { command: "Invoke-Command -ComputerName srv01, srv02 -ScriptBlock { Get-ChildItem Cert:\\LocalMachine\\My -ExpiringInDays 45 } | Select-Object PSComputerName, Subject, NotAfter, Thumbprint", explanation: "Revisión mensual: certificados de servidores que caducan en los próximos 45 días, antes de que dejen de funcionar HTTPS o RDP." },
      tags: ["certificados", "caducidad", "ssl", "iis", "almacen"]
    },

    // ---- Automatización
    {
      id: "win-export-clixml", name: "Get-Credential / Export-Clixml", os: "windows", shell: "powershell", category: "automation", risk: "caution",
      description: "Guarda credenciales cifradas para usarlas en scripts programados sin escribir contraseñas en texto plano.",
      syntax: "Get-Credential | Export-Clixml -Path archivo.xml | $c = Import-Clixml -Path archivo.xml",
      flags: [
        { flag: "Get-Credential", description: "Pide usuario y contraseña de forma segura." },
        { flag: "Export-Clixml", description: "Cifra con DPAPI: solo descifrable por el mismo usuario en el mismo equipo." },
        { flag: "Import-Clixml", description: "Recupera el objeto de credencial." },
        { flag: "-Credential $c", description: "Úsalo en Invoke-Command, New-PSDrive, etc." }
      ],
      example: { command: "Get-Credential CORP\\svc_backup | Export-Clixml C:\\Scripts\\svc_backup.xml; $c = Import-Clixml C:\\Scripts\\svc_backup.xml; New-PSDrive -Name B -PSProvider FileSystem -Root \\\\srv01\\Backups -Credential $c", explanation: "Ejecuta Export-Clixml con la misma cuenta que lanzará la tarea programada: el XML solo funcionará para esa cuenta y en ese equipo." },
      tags: ["credenciales", "contraseñas", "scripts", "dpapi", "seguridad"]
    },
    {
      id: "win-enable-psremoting", name: "Enable-PSRemoting / Enter-PSSession", os: "windows", shell: "powershell", category: "automation", risk: "caution",
      description: "Habilita la administración remota por WinRM y abre sesiones interactivas en otros equipos, como un SSH de Windows.",
      syntax: "Enable-PSRemoting -Force | Enter-PSSession -ComputerName equipo [-Credential] | Exit-PSSession",
      flags: [
        { flag: "Enable-PSRemoting -Force", description: "Configura WinRM, el listener y la regla de firewall." },
        { flag: "Enter-PSSession", description: "Sesión interactiva remota." },
        { flag: "Test-WSMan equipo", description: "Comprueba si WinRM responde." },
        { flag: "TrustedHosts", description: "Necesario para equipos fuera del dominio (con precaución)." }
      ],
      example: { command: "Test-WSMan srv01; Enter-PSSession -ComputerName srv01 -Credential CORP\\adm.jlopez", explanation: "Administra un servidor Core sin escritorio: comprueba que WinRM responde y abre una consola remota en él." },
      tags: ["winrm", "remoto", "pssession", "administracion remota", "core"]
    },
    {
      id: "win-start-process", name: "Start-Process", os: "windows", shell: "powershell", category: "automation", risk: "caution",
      description: "Lanza programas con opciones: como administrador, con otras credenciales, esperando a que terminen o capturando su código de salida.",
      syntax: "Start-Process -FilePath prog [-ArgumentList …] [-Verb RunAs] [-Wait] [-PassThru] [-WindowStyle Hidden]",
      flags: [
        { flag: "-Verb RunAs", description: "Ejecuta elevado (aviso UAC)." },
        { flag: "-Wait -PassThru", description: "Espera y devuelve el proceso (ExitCode)." },
        { flag: "-ArgumentList", description: "Argumentos del programa." },
        { flag: "-WindowStyle Hidden", description: "Sin ventana visible." }
      ],
      example: { command: "$p = Start-Process msiexec.exe -ArgumentList '/i C:\\Instaladores\\agente.msi /qn /norestart /l*v C:\\Temp\\agente.log' -Wait -PassThru; \"Código de salida: $($p.ExitCode)\"", explanation: "Instala un agente en silencio desde un script y comprueba el resultado (0 = correcto, 3010 = requiere reinicio)." },
      tags: ["ejecutar", "elevar", "runas", "esperar", "codigo de salida"]
    },

    // ---- Paquetes
    {
      id: "win-msiexec", name: "msiexec", os: "windows", shell: "cmd", category: "packages", risk: "caution",
      description: "Instala, repara y desinstala paquetes MSI de forma desatendida y con registro detallado.",
      syntax: "msiexec /i paquete.msi /qn [/norestart] [/l*v log] | msiexec /x {CódigoProducto} /qn",
      flags: [
        { flag: "/i | /x", description: "Instalar | desinstalar." },
        { flag: "/qn", description: "Totalmente silencioso." },
        { flag: "/l*v archivo.log", description: "Log detallado (clave para diagnosticar fallos)." },
        { flag: "/fa", description: "Repara reinstalando todos los archivos." }
      ],
      example: { command: "msiexec /i \"\\\\srv01\\Software\\7z2408-x64.msi\" /qn /norestart /l*v C:\\Temp\\7zip-install.log", explanation: "Despliegue silencioso desde un recurso compartido; si falla, busca «value 3» en el log para ver el error real." },
      tags: ["instalar", "desinstalar", "msi", "silencioso", "despliegue"]
    },
    {
      id: "win-installed-software", name: "Inventario de software instalado", os: "windows", shell: "powershell", category: "packages", risk: "safe",
      description: "Lista el software instalado leyendo las claves de desinstalación del Registro (rápido y sin los efectos secundarios de Win32_Product).",
      syntax: "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\WOW6432Node\\…\\Uninstall\\*",
      flags: [
        { flag: "Uninstall\\*", description: "Programas de 64 bits." },
        { flag: "WOW6432Node\\…\\Uninstall\\*", description: "Programas de 32 bits." },
        { flag: "UninstallString", description: "Comando para desinstalarlo." },
        { flag: "Evita Win32_Product", description: "Es lento y puede reparar paquetes MSI al consultarlo." }
      ],
      example: { command: "Get-ItemProperty HKLM:\\Software\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\*, HKLM:\\Software\\WOW6432Node\\Microsoft\\Windows\\CurrentVersion\\Uninstall\\* | Where-Object DisplayName | Select-Object DisplayName, DisplayVersion, Publisher, InstallDate | Sort-Object DisplayName | Export-Csv C:\\Temp\\software.csv -NoTypeInformation -Delimiter ';' -Encoding UTF8", explanation: "Inventario de software de un equipo en CSV para auditar licencias o localizar versiones vulnerables." },
      tags: ["inventario", "software", "programas instalados", "licencias", "auditoria"]
    },
    {
      id: "win-appxpackage", name: "Get-AppxPackage / Remove-AppxPackage", os: "windows", shell: "powershell", category: "packages", risk: "caution",
      description: "Gestiona las aplicaciones de la Microsoft Store (UWP/MSIX): listar, reinstalar las que fallan o quitar las preinstaladas innecesarias.",
      syntax: "Get-AppxPackage [-AllUsers] [*nombre*] | Remove-AppxPackage | Get-AppxProvisionedPackage -Online",
      flags: [
        { flag: "-AllUsers", description: "Paquetes de todos los usuarios (requiere admin)." },
        { flag: "Remove-AppxPackage", description: "Desinstala para el usuario." },
        { flag: "Remove-AppxProvisionedPackage -Online", description: "Evita que se instale en usuarios nuevos." },
        { flag: "Add-AppxPackage -Register …AppxManifest.xml", description: "Reinstala una app dañada." }
      ],
      example: { command: "Get-AppxPackage -AllUsers *Xbox* | Remove-AppxPackage -AllUsers; Get-AppxProvisionedPackage -Online | Where-Object DisplayName -like '*Xbox*' | Remove-AppxProvisionedPackage -Online", explanation: "Limpia las aplicaciones de Xbox de los equipos de oficina, también para los usuarios que se creen después." },
      tags: ["store", "apps", "bloatware", "uwp", "desinstalar"]
    },

    // ---- Active Directory
    {
      id: "win-ad-passwordpolicy", name: "Get-ADDefaultDomainPasswordPolicy", os: "windows", shell: "powershell", category: "ad", risk: "safe",
      description: "Muestra la directiva de contraseñas y bloqueo del dominio y las directivas granulares (FGPP) que se aplican a un usuario.",
      syntax: "Get-ADDefaultDomainPasswordPolicy | Get-ADFineGrainedPasswordPolicy -Filter * | Get-ADUserResultantPasswordPolicy usuario",
      flags: [
        { flag: "MinPasswordLength / MaxPasswordAge", description: "Longitud mínima y caducidad." },
        { flag: "LockoutThreshold / LockoutDuration", description: "Intentos antes del bloqueo y su duración." },
        { flag: "Get-ADFineGrainedPasswordPolicy", description: "Directivas granulares (p. ej. para administradores)." },
        { flag: "Get-ADUserResultantPasswordPolicy", description: "Qué directiva granular afecta a un usuario." }
      ],
      example: { command: "Get-ADDefaultDomainPasswordPolicy | Select-Object MinPasswordLength, MaxPasswordAge, LockoutThreshold, LockoutDuration; Get-ADUserResultantPasswordPolicy jlopez", explanation: "Respuesta para auditoría: política de contraseñas y bloqueo vigente y si un usuario tiene una política granular distinta." },
      tags: ["contraseñas", "directiva", "bloqueo", "fgpp", "auditoria"]
    },
    {
      id: "win-new-adou", name: "New-ADOrganizationalUnit / Get-ADOrganizationalUnit", os: "windows", shell: "powershell", category: "ad", risk: "caution",
      description: "Crea y consulta unidades organizativas (OU) protegidas contra borrado accidental.",
      syntax: "New-ADOrganizationalUnit -Name n -Path DN [-ProtectedFromAccidentalDeletion $true] | Get-ADOrganizationalUnit -Filter *",
      flags: [
        { flag: "-Path", description: "OU o dominio padre (DN)." },
        { flag: "-ProtectedFromAccidentalDeletion", description: "Impide borrarla sin quitar antes la protección." },
        { flag: "Get-ADOrganizationalUnit -Filter * | Select DistinguishedName", description: "Árbol de OUs." },
        { flag: "Set-ADOrganizationalUnit -ProtectedFromAccidentalDeletion $false", description: "Quita la protección para poder borrarla." }
      ],
      example: { command: "'Usuarios','Equipos','Grupos' | ForEach-Object { New-ADOrganizationalUnit -Name $_ -Path 'OU=Valencia,DC=corp,DC=local' -ProtectedFromAccidentalDeletion $true }", explanation: "Crea la estructura estándar de OUs para una sede nueva, protegida contra borrados por error." },
      tags: ["ou", "unidad organizativa", "estructura", "dominio", "proteccion"]
    },
    {
      id: "win-set-aduser-bulk", name: "Set-ADUser (cambios masivos)", os: "windows", shell: "powershell", category: "ad", risk: "caution",
      description: "Modifica atributos de usuarios de AD en bloque: departamento, cargo, teléfono, responsable, oficina…",
      syntax: "Get-ADUser -Filter … | Set-ADUser -Department d -Title t -Office o -Manager m [-WhatIf]",
      flags: [
        { flag: "-Department / -Title / -Office", description: "Atributos más comunes." },
        { flag: "-Manager", description: "Responsable (para organigramas y flujos)." },
        { flag: "-Replace @{atributo='valor'}", description: "Cualquier atributo LDAP." },
        { flag: "-WhatIf", description: "Simula los cambios antes de aplicarlos." }
      ],
      example: { command: "Import-Csv cambios.csv | ForEach-Object { Set-ADUser -Identity $_.Usuario -Department $_.Departamento -Title $_.Cargo -Office $_.Oficina -WhatIf }", explanation: "Reorganización: actualiza departamento, cargo y oficina de muchos usuarios desde un CSV de RR. HH. (quita -WhatIf tras revisar)." },
      tags: ["usuarios", "masivo", "atributos", "csv", "departamento"]
    },

    /* ============ CISCO IOS · PACKET TRACER (temario CCNA) ============
       Comandos de IOS admitidos por Cisco Packet Tracer 8.x. Topología de los ejemplos:
       R1/R2 routers, SW1/SW2 switches, VLAN 10 Ventas, 20 Contabilidad, 99 Gestión. */

    // ---- Configuración básica y acceso
    {
      id: "pt-modes", name: "enable / configure terminal / end", os: "network", shell: "ios", category: "packettracer", risk: "safe",
      description: "Modos de IOS: usuario (>), privilegiado (#), configuración global (config)# y submodos. Con «do» se ejecutan comandos show sin salir del modo de configuración.",
      syntax: "enable → configure terminal → interface … → exit | end | do show …",
      requires: "Cisco Packet Tracer 8.x o un equipo con Cisco IOS.",
      flags: [
        { flag: "enable", description: "Pasa al modo privilegiado (#)." },
        { flag: "configure terminal (conf t)", description: "Entra en configuración global." },
        { flag: "exit / end (Ctrl+Z)", description: "Sube un nivel / vuelve directamente al modo privilegiado." },
        { flag: "do show …", description: "Ejecuta un show desde cualquier modo de configuración." }
      ],
      example: { command: "enable\nconfigure terminal\ninterface GigabitEthernet0/0\ndo show ip interface brief\nend", explanation: "Recorrido típico de una práctica: entrar a configurar una interfaz y comprobar el estado sin salir del modo de configuración." },
      tags: ["modos", "enable", "conf t", "ios", "ccna"]
    },
    {
      id: "pt-basic-config", name: "hostname / banner motd / no ip domain-lookup", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Configuración inicial de cualquier router o switch: nombre, aviso legal y evitar que un comando mal escrito se interprete como un nombre DNS.",
      syntax: "hostname NOMBRE | banner motd # texto # | no ip domain-lookup",
      requires: "Cisco Packet Tracer 8.x o un equipo con Cisco IOS (configuración global).",
      flags: [
        { flag: "hostname R1", description: "Nombre del equipo (cambia el prompt)." },
        { flag: "banner motd # … #", description: "Mensaje que se muestra al conectar; # es el delimitador." },
        { flag: "no ip domain-lookup", description: "Evita la espera al teclear mal un comando." },
        { flag: "line console 0 → logging synchronous", description: "Los mensajes de log no cortan lo que escribes." }
      ],
      example: { command: "configure terminal\nhostname R1\nno ip domain-lookup\nbanner motd # Acceso solo para personal autorizado #\nline console 0\n logging synchronous\n exec-timeout 10 0\nend", explanation: "Lo primero en cualquier práctica de Packet Tracer o en un equipo nuevo: nombre, aviso legal y consola cómoda de usar." },
      tags: ["hostname", "banner", "configuracion inicial", "domain-lookup", "consola"]
    },
    {
      id: "pt-passwords", name: "enable secret / line console / service password-encryption", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Protege el acceso al equipo: contraseña del modo privilegiado, de la consola y de las líneas VTY, y cifrado de las contraseñas en la configuración.",
      syntax: "enable secret clave | line console 0 → password clave → login | service password-encryption",
      requires: "Cisco Packet Tracer 8.x o un equipo con Cisco IOS (configuración global).",
      flags: [
        { flag: "enable secret", description: "Contraseña del modo privilegiado con hash (no uses enable password)." },
        { flag: "line console 0 / line vty 0 15", description: "Consola física / accesos remotos (Telnet/SSH)." },
        { flag: "login", description: "Exige la contraseña de la línea." },
        { flag: "service password-encryption", description: "Oculta las contraseñas en texto plano del running-config." }
      ],
      example: { command: "configure terminal\nenable secret Cl4ss!Priv\nline console 0\n password C0ns0la!\n login\nline vty 0 15\n password Vty!2026\n login\nexit\nservice password-encryption", explanation: "Asegura el acceso básico de un switch del laboratorio. En producción usa SSH con usuarios locales (siguiente comando)." },
      tags: ["contraseñas", "enable secret", "consola", "vty", "seguridad"]
    },
    {
      id: "pt-ssh", name: "SSH (crypto key generate rsa / transport input ssh)", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Habilita la administración remota segura por SSH v2 con usuarios locales y desactiva Telnet.",
      syntax: "ip domain-name dominio → crypto key generate rsa → username u privilege 15 secret clave → line vty 0 15 → transport input ssh → login local",
      requires: "Cisco Packet Tracer 8.x o un equipo con Cisco IOS; hostname y nombre de dominio configurados.",
      flags: [
        { flag: "crypto key generate rsa (1024+)", description: "Genera las claves; SSH v2 necesita al menos 768 bits (usa 2048)." },
        { flag: "ip ssh version 2", description: "Solo la versión segura del protocolo." },
        { flag: "login local", description: "Autentica con los usuarios locales." },
        { flag: "transport input ssh", description: "Bloquea Telnet en las líneas VTY." }
      ],
      example: { command: "configure terminal\nip domain-name corp.local\ncrypto key generate rsa general-keys modulus 2048\nip ssh version 2\nusername admin privilege 15 secret Adm!n2026\nline vty 0 15\n login local\n transport input ssh\nend\nshow ip ssh", explanation: "Configuración de SSH que se pide en casi todas las prácticas del CCNA. Pruébalo desde un PC de Packet Tracer con «ssh -l admin 192.168.99.2»." },
      tags: ["ssh", "acceso remoto", "telnet", "usuarios", "seguridad"]
    },
    {
      id: "pt-erase-reload", name: "erase startup-config / reload", os: "network", shell: "ios", category: "packettracer", risk: "danger",
      description: "Borra la configuración guardada y reinicia el equipo para dejarlo de fábrica. En un switch hay que borrar también vlan.dat.",
      syntax: "erase startup-config | delete flash:vlan.dat | reload",
      requires: "Modo privilegiado (enable).",
      flags: [
        { flag: "erase startup-config (write erase)", description: "Borra la configuración de arranque." },
        { flag: "delete flash:vlan.dat", description: "Borra la base de datos de VLAN del switch." },
        { flag: "reload", description: "Reinicia; responde «no» a guardar los cambios." },
        { flag: "copy running-config tftp:", description: "Haz copia antes si quieres conservarla." }
      ],
      example: { command: "erase startup-config\ndelete flash:vlan.dat\nreload", explanation: "Deja un switch de laboratorio como nuevo antes de empezar otra práctica. Irreversible: guarda antes lo que necesites." },
      tags: ["borrar", "fabrica", "reset", "reload", "vlan.dat"]
    },
    {
      id: "pt-ntp-logging", name: "ntp server / logging host / clock", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Sincroniza la hora con un servidor NTP y envía los logs a un servidor syslog, con marca de tiempo para poder correlacionar eventos.",
      syntax: "ntp server IP | logging host IP | service timestamps log datetime msec | show clock | show ntp status",
      requires: "Cisco Packet Tracer 8.x (servidor con los servicios NTP y Syslog activados) o un equipo con Cisco IOS.",
      flags: [
        { flag: "ntp server", description: "Servidor de hora." },
        { flag: "logging host / logging trap", description: "Servidor syslog / nivel mínimo a enviar." },
        { flag: "service timestamps log datetime msec", description: "Fecha y hora en cada mensaje." },
        { flag: "show ntp associations", description: "Estado de la sincronización." }
      ],
      example: { command: "configure terminal\nntp server 192.168.99.10\nservice timestamps log datetime msec\nlogging host 192.168.99.10\nlogging trap informational\nend\nshow ntp status", explanation: "Todos los equipos de la práctica envían sus logs al servidor de gestión con la hora sincronizada." },
      tags: ["ntp", "hora", "syslog", "logs", "timestamps"]
    },

    // ---- Interfaces
    {
      id: "pt-interface-ip", name: "interface / ip address / no shutdown", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Configura la IP de una interfaz de router y la activa (en los routers las interfaces vienen apagadas).",
      syntax: "interface Gi0/0 → description texto → ip address IP MÁSCARA → no shutdown",
      requires: "Cisco Packet Tracer 8.x o un equipo con Cisco IOS.",
      flags: [
        { flag: "interface GigabitEthernet0/0", description: "Selecciona la interfaz (abreviable a g0/0)." },
        { flag: "ip address IP MÁSCARA", description: "Dirección y máscara en formato decimal." },
        { flag: "no shutdown", description: "Activa la interfaz." },
        { flag: "clock rate 64000", description: "Solo en el extremo DCE de un enlace serie." }
      ],
      example: { command: "configure terminal\ninterface GigabitEthernet0/0\n description LAN Ventas\n ip address 192.168.10.1 255.255.255.0\n no shutdown\ninterface Serial0/0/0\n description Enlace a R2\n ip address 10.0.0.1 255.255.255.252\n clock rate 64000\n no shutdown\nend", explanation: "Configura la LAN y el enlace serie hacia R2. El «clock rate» solo va en el lado DCE (el del icono del reloj en Packet Tracer)." },
      tags: ["interfaz", "ip", "no shutdown", "serial", "direccionamiento"]
    },
    {
      id: "pt-interface-range", name: "interface range / shutdown", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Aplica la misma configuración a varios puertos a la vez; buena práctica: apagar los puertos que no se usan y llevarlos a una VLAN sin uso.",
      syntax: "interface range Fa0/1 - 24 | interface range Fa0/1 - 5 , Gi0/1",
      requires: "Cisco Packet Tracer 8.x o un equipo con Cisco IOS.",
      flags: [
        { flag: "interface range Fa0/10 - 24", description: "Rango de puertos (espacios alrededor del guion)." },
        { flag: ", Gi0/2", description: "Combina rangos y puertos sueltos." },
        { flag: "shutdown", description: "Apaga los puertos." },
        { flag: "switchport access vlan 999", description: "VLAN «aparcamiento» sin uso." }
      ],
      example: { command: "configure terminal\nvlan 999\n name SIN_USO\ninterface range FastEthernet0/10 - 24\n switchport mode access\n switchport access vlan 999\n shutdown\nend", explanation: "Endurece un switch: los puertos libres quedan apagados y en una VLAN sin acceso a nada." },
      tags: ["rango", "puertos", "shutdown", "seguridad", "switch"]
    },
    {
      id: "pt-speed-duplex", name: "speed / duplex / show interfaces status", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Fija velocidad y dúplex de un puerto cuando la autonegociación falla o hay que igualar ambos extremos.",
      syntax: "interface Fa0/1 → speed 10|100|1000|auto → duplex half|full|auto",
      requires: "Cisco Packet Tracer 8.x o un equipo con Cisco IOS.",
      flags: [
        { flag: "speed 100", description: "Velocidad fija." },
        { flag: "duplex full", description: "Dúplex fijo; debe coincidir en los dos extremos." },
        { flag: "show interfaces status", description: "Velocidad y dúplex negociados de cada puerto." },
        { flag: "Errores late collision / CRC", description: "Síntoma típico de un dúplex desigual." }
      ],
      example: { command: "configure terminal\ninterface FastEthernet0/24\n speed 100\n duplex full\nend\nshow interfaces FastEthernet0/24 | include duplex|collision", explanation: "Corrige un enlace lento por desajuste de dúplex y comprueba que desaparecen las colisiones tardías." },
      tags: ["velocidad", "duplex", "autonegociacion", "colisiones", "puerto"]
    },
    {
      id: "pt-loopback", name: "interface loopback", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Crea una interfaz virtual que siempre está activa: ideal como router-id de OSPF, para gestión o para simular redes en una práctica.",
      syntax: "interface loopback N → ip address IP 255.255.255.255",
      requires: "Cisco Packet Tracer 8.x o un equipo con Cisco IOS.",
      flags: [
        { flag: "interface loopback 0", description: "Crea la loopback 0." },
        { flag: "/32 (255.255.255.255)", description: "Máscara habitual para una loopback." },
        { flag: "Siempre up", description: "No depende de ningún cable." }
      ],
      example: { command: "configure terminal\ninterface loopback 0\n ip address 1.1.1.1 255.255.255.255\nend\nshow ip interface brief | include Loopback", explanation: "Da a R1 una dirección estable que OSPF usará como router-id y que sirve para probar el routing con ping." },
      tags: ["loopback", "router-id", "virtual", "gestion", "ospf"]
    },

    // ---- VLAN y switching
    {
      id: "pt-vlan", name: "vlan / name / show vlan brief", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Crea VLAN con nombre en un switch y comprueba qué puertos pertenecen a cada una.",
      syntax: "vlan N → name NOMBRE | show vlan brief | no vlan N",
      requires: "Cisco Packet Tracer 8.x o un switch con Cisco IOS.",
      flags: [
        { flag: "vlan 10", description: "Crea la VLAN (o entra a editarla)." },
        { flag: "name VENTAS", description: "Nombre descriptivo." },
        { flag: "show vlan brief", description: "VLAN y puertos de acceso asignados (los trunks no salen)." },
        { flag: "no vlan 10", description: "Borra la VLAN: sus puertos quedan inactivos." }
      ],
      example: { command: "configure terminal\nvlan 10\n name VENTAS\nvlan 20\n name CONTABILIDAD\nvlan 99\n name GESTION\nend\nshow vlan brief", explanation: "Crea las VLAN de la práctica. Después asigna los puertos con «switchport access vlan» (categoría Equipos de red)." },
      tags: ["vlan", "crear", "nombre", "switch", "segmentacion"]
    },
    {
      id: "pt-trunk", name: "switchport mode trunk / show interfaces trunk", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Configura un enlace troncal 802.1Q entre switches (o hacia un router) que transporta varias VLAN, con VLAN nativa y lista de VLAN permitidas.",
      syntax: "interface Gi0/1 → switchport mode trunk → switchport trunk native vlan N → switchport trunk allowed vlan lista",
      requires: "Cisco Packet Tracer 8.x o un switch con Cisco IOS.",
      flags: [
        { flag: "switchport mode trunk", description: "Fuerza el modo troncal." },
        { flag: "switchport trunk native vlan 99", description: "VLAN sin etiquetar (igual en ambos extremos)." },
        { flag: "switchport trunk allowed vlan 10,20,99", description: "Solo esas VLAN cruzan el trunk." },
        { flag: "switchport nonegotiate", description: "Desactiva DTP (buena práctica de seguridad)." }
      ],
      example: { command: "configure terminal\ninterface GigabitEthernet0/1\n switchport mode trunk\n switchport trunk native vlan 99\n switchport trunk allowed vlan 10,20,99\n switchport nonegotiate\nend\nshow interfaces trunk", explanation: "Enlace troncal SW1–SW2. Si la VLAN nativa no coincide en los dos lados, CDP avisa de «native VLAN mismatch»." },
      tags: ["trunk", "troncal", "802.1q", "vlan nativa", "dtp"]
    },
    {
      id: "pt-voice-vlan", name: "switchport voice vlan", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Puerto de acceso con VLAN de datos para el PC y VLAN de voz para el teléfono IP conectado en cascada.",
      syntax: "interface Fa0/N → switchport mode access → switchport access vlan D → switchport voice vlan V → mls qos trust cos",
      requires: "Cisco Packet Tracer 8.x o un switch con Cisco IOS.",
      flags: [
        { flag: "switchport voice vlan 150", description: "VLAN para el tráfico del teléfono." },
        { flag: "mls qos trust cos", description: "Confía en el marcado de prioridad del teléfono." },
        { flag: "show interfaces Fa0/5 switchport", description: "Comprueba VLAN de acceso y de voz." }
      ],
      example: { command: "configure terminal\nvlan 150\n name VOZ\ninterface FastEthernet0/5\n switchport mode access\n switchport access vlan 10\n switchport voice vlan 150\n mls qos trust cos\nend", explanation: "Puesto de trabajo con teléfono IP: el PC va a la VLAN 10 y el teléfono a la VLAN de voz 150." },
      tags: ["voz", "telefono ip", "voip", "vlan", "qos"]
    },
    {
      id: "pt-vtp", name: "vtp mode / vtp domain / show vtp status", os: "network", shell: "ios", category: "packettracer", risk: "danger",
      description: "VTP propaga las VLAN entre switches. Un switch con un número de revisión mayor puede sobrescribir (y borrar) las VLAN de toda la red.",
      syntax: "vtp mode server|client|transparent | vtp domain NOMBRE | vtp password clave | show vtp status",
      requires: "Cisco Packet Tracer 8.x o un switch con Cisco IOS.",
      flags: [
        { flag: "vtp mode transparent", description: "No aprende ni anuncia VLAN (la opción más segura)." },
        { flag: "vtp domain", description: "Dominio VTP compartido." },
        { flag: "vtp password", description: "Evita que un switch ajeno se una al dominio." },
        { flag: "Configuration Revision", description: "Pon a 0 un switch nuevo antes de conectarlo (cambia el dominio)." }
      ],
      example: { command: "configure terminal\nvtp domain CORP\nvtp password Vtp!2026\nvtp mode client\nend\nshow vtp status", explanation: "Une un switch de acceso al dominio VTP como cliente. Antes de conectar un switch usado, comprueba que su revisión es 0." },
      tags: ["vtp", "vlan", "propagacion", "dominio", "revision"]
    },
    {
      id: "pt-stp", name: "spanning-tree mode / vlan priority / show spanning-tree", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Configura Spanning Tree para evitar bucles: modo Rapid PVST+, elección del root bridge por VLAN y diagnóstico de puertos bloqueados.",
      syntax: "spanning-tree mode rapid-pvst | spanning-tree vlan N root primary|priority P | show spanning-tree [vlan N]",
      requires: "Cisco Packet Tracer 8.x o un switch con Cisco IOS.",
      flags: [
        { flag: "spanning-tree mode rapid-pvst", description: "RSTP por VLAN: convergencia en segundos." },
        { flag: "vlan 10 root primary", description: "Hace de este switch el root bridge de la VLAN." },
        { flag: "vlan 10 priority 4096", description: "Prioridad manual (múltiplos de 4096)." },
        { flag: "show spanning-tree summary", description: "Modo y estado de cada VLAN." }
      ],
      example: { command: "configure terminal\nspanning-tree mode rapid-pvst\nspanning-tree vlan 10,20 root primary\nspanning-tree vlan 99 root secondary\nend\nshow spanning-tree vlan 10", explanation: "El switch de distribución será el root de las VLAN de usuarios: el tráfico sigue el camino previsto y no uno elegido al azar." },
      tags: ["stp", "spanning tree", "rstp", "root bridge", "bucles"]
    },
    {
      id: "pt-portfast", name: "spanning-tree portfast / bpduguard", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Puertos de equipos finales: PortFast los activa al instante y BPDU Guard los apaga si alguien conecta un switch, evitando bucles.",
      syntax: "interface Fa0/N → spanning-tree portfast → spanning-tree bpduguard enable | spanning-tree portfast default",
      requires: "Cisco Packet Tracer 8.x o un switch con Cisco IOS.",
      flags: [
        { flag: "spanning-tree portfast", description: "Pasa a forwarding sin esperar (solo puertos de acceso)." },
        { flag: "spanning-tree bpduguard enable", description: "Pone el puerto en err-disabled si recibe BPDU." },
        { flag: "spanning-tree portfast default", description: "PortFast en todos los puertos de acceso." },
        { flag: "spanning-tree portfast bpduguard default", description: "BPDU Guard global." }
      ],
      example: { command: "configure terminal\ninterface range FastEthernet0/1 - 9\n spanning-tree portfast\n spanning-tree bpduguard enable\nend", explanation: "Los PC arrancan con red al momento y un switch doméstico conectado por un usuario no puede crear un bucle." },
      tags: ["portfast", "bpdu guard", "stp", "seguridad", "acceso"]
    },
    {
      id: "pt-etherchannel", name: "channel-group / show etherchannel summary", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Agrupa varios enlaces físicos en uno lógico (EtherChannel) con LACP o PAgP: más ancho de banda y redundancia sin bloqueos de STP.",
      syntax: "interface range Gi0/1 - 2 → channel-group N mode active|passive|desirable|auto|on → interface port-channel N",
      requires: "Cisco Packet Tracer 8.x o un switch con Cisco IOS.",
      flags: [
        { flag: "mode active / passive", description: "LACP (estándar)." },
        { flag: "mode desirable / auto", description: "PAgP (propietario de Cisco)." },
        { flag: "interface port-channel 1", description: "Se configura la interfaz lógica (trunk, VLAN…)." },
        { flag: "show etherchannel summary", description: "Flags SU / P = correcto; «s» o «I» = problema." }
      ],
      example: { command: "configure terminal\ninterface range GigabitEthernet0/1 - 2\n channel-group 1 mode active\ninterface port-channel 1\n switchport mode trunk\n switchport trunk allowed vlan 10,20,99\nend\nshow etherchannel summary", explanation: "Une los dos enlaces entre SW1 y SW2 con LACP. Los puertos miembros deben tener la misma velocidad, dúplex y configuración." },
      tags: ["etherchannel", "lacp", "pagp", "port-channel", "agregacion"]
    },
    {
      id: "pt-port-security", name: "switchport port-security", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Limita qué y cuántas direcciones MAC pueden usar un puerto de acceso y qué pasa si se conecta un equipo no autorizado.",
      syntax: "switchport port-security → maximum N → mac-address sticky → violation shutdown|restrict|protect",
      requires: "Cisco Packet Tracer 8.x o un switch con Cisco IOS; el puerto debe estar en modo access.",
      flags: [
        { flag: "switchport port-security maximum 2", description: "Máximo de MAC permitidas." },
        { flag: "mac-address sticky", description: "Aprende las MAC y las guarda en la configuración." },
        { flag: "violation shutdown / restrict / protect", description: "Apagar puerto / descartar y registrar / solo descartar." },
        { flag: "show port-security interface Fa0/1", description: "Estado, MAC aprendidas y violaciones." }
      ],
      example: { command: "configure terminal\ninterface FastEthernet0/1\n switchport mode access\n switchport port-security\n switchport port-security maximum 2\n switchport port-security mac-address sticky\n switchport port-security violation restrict\nend\nshow port-security interface FastEthernet0/1", explanation: "Solo el PC y el teléfono del puesto pueden usar la boca; un portátil ajeno se descarta y queda registrado." },
      tags: ["port security", "mac", "sticky", "violacion", "seguridad"]
    },
    {
      id: "pt-errdisable", name: "show interfaces status err-disabled / errdisable recovery", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Localiza puertos apagados por seguridad (port-security, BPDU Guard…) y los recupera manualmente o de forma automática.",
      syntax: "show interfaces status err-disabled | interface Fa0/N → shutdown → no shutdown | errdisable recovery cause …",
      requires: "Cisco Packet Tracer 8.x o un switch con Cisco IOS.",
      flags: [
        { flag: "show interfaces status err-disabled", description: "Puertos en err-disabled y el motivo." },
        { flag: "shutdown + no shutdown", description: "Recuperación manual tras corregir la causa." },
        { flag: "errdisable recovery cause psecure-violation", description: "Recuperación automática por causa." },
        { flag: "errdisable recovery interval 300", description: "Segundos de espera antes de reactivar." }
      ],
      example: { command: "show interfaces status err-disabled\nconfigure terminal\ninterface FastEthernet0/1\n shutdown\n no shutdown\nend", explanation: "Un usuario se queda sin red tras conectar un switch: localiza el puerto apagado por BPDU Guard y reactívalo una vez retirado el equipo." },
      tags: ["err-disabled", "puerto apagado", "recuperar", "bpdu guard", "port security"]
    },
    {
      id: "pt-svi-mgmt", name: "interface vlan / ip default-gateway", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Da una IP de gestión a un switch de capa 2 mediante una SVI y su puerta de enlace, para administrarlo por SSH.",
      syntax: "interface vlan 99 → ip address IP MÁSCARA → no shutdown | ip default-gateway IP",
      requires: "Cisco Packet Tracer 8.x o un switch con Cisco IOS.",
      flags: [
        { flag: "interface vlan 99", description: "Interfaz virtual de la VLAN de gestión." },
        { flag: "no shutdown", description: "La SVI solo sube si la VLAN existe y tiene algún puerto activo." },
        { flag: "ip default-gateway", description: "Router para administrar el switch desde otras redes." }
      ],
      example: { command: "configure terminal\ninterface vlan 99\n ip address 192.168.99.2 255.255.255.0\n no shutdown\nexit\nip default-gateway 192.168.99.1\nend", explanation: "El switch SW1 queda accesible en 192.168.99.2 desde cualquier red, a través del router de la VLAN de gestión." },
      tags: ["svi", "gestion", "default-gateway", "vlan 99", "ip switch"]
    },
    {
      id: "pt-dhcp-snooping", name: "ip dhcp snooping", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Bloquea servidores DHCP no autorizados: solo los puertos marcados como de confianza pueden enviar ofertas DHCP.",
      syntax: "ip dhcp snooping → ip dhcp snooping vlan N → interface X → ip dhcp snooping trust | show ip dhcp snooping",
      requires: "Cisco Packet Tracer 8.x o un switch con Cisco IOS.",
      flags: [
        { flag: "ip dhcp snooping vlan 10,20", description: "VLAN protegidas." },
        { flag: "ip dhcp snooping trust", description: "Puerto hacia el servidor DHCP o el trunk de subida." },
        { flag: "ip dhcp snooping limit rate 10", description: "Limita peticiones por segundo (contra agotamiento)." },
        { flag: "show ip dhcp snooping binding", description: "Tabla IP–MAC–puerto aprendida." }
      ],
      example: { command: "configure terminal\nip dhcp snooping\nip dhcp snooping vlan 10,20\nno ip dhcp snooping information option\ninterface GigabitEthernet0/1\n ip dhcp snooping trust\ninterface range FastEthernet0/1 - 24\n ip dhcp snooping limit rate 10\nend", explanation: "Un router doméstico conectado por error ya no puede repartir IPs a los usuarios de las VLAN 10 y 20." },
      tags: ["dhcp snooping", "seguridad", "rogue dhcp", "trust", "capa 2"]
    },
    {
      id: "pt-arp-inspection", name: "ip arp inspection", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Dynamic ARP Inspection: descarta respuestas ARP falsas (ARP spoofing) comparándolas con la tabla de DHCP snooping.",
      syntax: "ip arp inspection vlan N | interface X → ip arp inspection trust | show ip arp inspection",
      requires: "Cisco Packet Tracer 8.x o un switch con Cisco IOS; DHCP snooping activado.",
      flags: [
        { flag: "ip arp inspection vlan 10,20", description: "Activa DAI en esas VLAN." },
        { flag: "ip arp inspection trust", description: "Puertos de confianza (trunks, routers)." },
        { flag: "ip arp inspection validate src-mac dst-mac ip", description: "Comprobaciones adicionales." }
      ],
      example: { command: "configure terminal\nip arp inspection vlan 10,20\ninterface GigabitEthernet0/1\n ip arp inspection trust\nend\nshow ip arp inspection vlan 10", explanation: "Impide ataques de intermediario por ARP spoofing en las VLAN de usuarios." },
      tags: ["dai", "arp spoofing", "seguridad", "capa 2", "mitm"]
    },

    // ---- Routing
    {
      id: "pt-roas", name: "router-on-a-stick (encapsulation dot1Q)", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Enrutamiento entre VLAN con un solo enlace troncal hacia el router, usando una subinterfaz por VLAN.",
      syntax: "interface Gi0/0.N → encapsulation dot1Q N [native] → ip address IP MÁSCARA",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS; el puerto del switch hacia el router en modo trunk.",
      flags: [
        { flag: "interface g0/0.10", description: "Subinterfaz (el número suele coincidir con la VLAN)." },
        { flag: "encapsulation dot1Q 10", description: "Etiqueta 802.1Q de la VLAN." },
        { flag: "encapsulation dot1Q 99 native", description: "VLAN nativa sin etiquetar." },
        { flag: "no shutdown en la física", description: "La interfaz física debe estar activa." }
      ],
      example: { command: "configure terminal\ninterface GigabitEthernet0/0\n no shutdown\ninterface GigabitEthernet0/0.10\n encapsulation dot1Q 10\n ip address 192.168.10.1 255.255.255.0\ninterface GigabitEthernet0/0.20\n encapsulation dot1Q 20\n ip address 192.168.20.1 255.255.255.0\ninterface GigabitEthernet0/0.99\n encapsulation dot1Q 99 native\n ip address 192.168.99.1 255.255.255.0\nend", explanation: "Clásico del CCNA: R1 enruta entre Ventas, Contabilidad y Gestión con un único cable hacia SW1." },
      tags: ["inter-vlan", "router on a stick", "subinterfaz", "dot1q", "enrutamiento"]
    },
    {
      id: "pt-l3-switch", name: "ip routing / no switchport (switch de capa 3)", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Enrutamiento entre VLAN en un switch multicapa (3560/3650) con SVI, y puertos enrutados hacia el router.",
      syntax: "ip routing | interface vlan N → ip address … | interface Gi0/1 → no switchport → ip address …",
      requires: "Cisco Packet Tracer 8.x con un switch multicapa (3560-24PS o 3650) o un switch L3 con Cisco IOS.",
      flags: [
        { flag: "ip routing", description: "Activa el enrutamiento en el switch." },
        { flag: "interface vlan 10", description: "SVI que actúa como puerta de enlace de la VLAN." },
        { flag: "no switchport", description: "Convierte un puerto en enrutado (como el de un router)." }
      ],
      example: { command: "configure terminal\nip routing\ninterface vlan 10\n ip address 192.168.10.1 255.255.255.0\ninterface vlan 20\n ip address 192.168.20.1 255.255.255.0\ninterface GigabitEthernet0/1\n no switchport\n ip address 10.0.0.2 255.255.255.252\nexit\nip route 0.0.0.0 0.0.0.0 10.0.0.1\nend", explanation: "El switch de distribución enruta entre VLAN a velocidad de cable y envía el resto del tráfico a R1." },
      tags: ["capa 3", "multicapa", "svi", "ip routing", "inter-vlan"]
    },
    {
      id: "pt-static-route", name: "ip route (rutas estáticas y por defecto)", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Rutas estáticas, ruta por defecto y ruta flotante de respaldo con mayor distancia administrativa.",
      syntax: "ip route RED MÁSCARA siguiente-salto|interfaz [distancia]",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "ip route 0.0.0.0 0.0.0.0 …", description: "Ruta por defecto (salida a Internet)." },
        { flag: "… 10.0.0.2", description: "Siguiente salto (IP del router vecino)." },
        { flag: "… Serial0/0/0", description: "Interfaz de salida (enlaces punto a punto)." },
        { flag: "… 200", description: "Distancia administrativa: ruta flotante de respaldo." }
      ],
      example: { command: "configure terminal\nip route 192.168.30.0 255.255.255.0 10.0.0.2\nip route 0.0.0.0 0.0.0.0 203.0.113.1\nip route 0.0.0.0 0.0.0.0 10.0.0.6 200\nend\nshow ip route static", explanation: "Ruta a la LAN de R2, salida a Internet por el ISP principal y una ruta por defecto de respaldo que solo se usa si cae la principal." },
      tags: ["ruta estatica", "ruta por defecto", "flotante", "routing", "siguiente salto"]
    },
    {
      id: "pt-show-ip-route", name: "show ip route / show ip protocols", os: "network", shell: "ios", category: "packettracer", risk: "safe",
      description: "Tabla de enrutamiento con el origen de cada ruta (C, L, S, O, D, R…) y los protocolos de enrutamiento activos.",
      syntax: "show ip route [static|ospf|eigrp|connected|IP] | show ip protocols",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "C / L / S", description: "Conectada / local / estática." },
        { flag: "O / D / R", description: "OSPF / EIGRP / RIP." },
        { flag: "[110/2]", description: "[distancia administrativa / métrica]." },
        { flag: "show ip route 192.168.30.5", description: "Qué ruta usaría para un destino concreto." }
      ],
      example: { command: "show ip route\nshow ip route 192.168.30.5\nshow ip protocols", explanation: "Diagnóstico básico de cualquier práctica: ¿conoce el router la red destino, por qué protocolo y por qué vecino?" },
      tags: ["tabla de rutas", "routing", "diagnostico", "show ip route", "protocolos"]
    },
    {
      id: "pt-ospf", name: "router ospf / network area", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "OSPFv2 de área única: anuncia las redes, fija el router-id y evita enviar hellos hacia las LAN de usuarios.",
      syntax: "router ospf ID → router-id X.X.X.X → network RED WILDCARD area A → passive-interface IF",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "router-id 1.1.1.1", description: "Identificador fijo del router." },
        { flag: "network 192.168.10.0 0.0.0.255 area 0", description: "Red con máscara wildcard y área." },
        { flag: "passive-interface g0/0", description: "Anuncia la red pero no envía hellos por esa interfaz." },
        { flag: "ip ospf 1 area 0 (en la interfaz)", description: "Alternativa: activar OSPF por interfaz." }
      ],
      example: { command: "configure terminal\nrouter ospf 1\n router-id 1.1.1.1\n network 192.168.10.0 0.0.0.255 area 0\n network 10.0.0.0 0.0.0.3 area 0\n passive-interface GigabitEthernet0/0\nend", explanation: "R1 forma adyacencia con R2 por el enlace 10.0.0.0/30 y anuncia su LAN sin enviar paquetes OSPF a los PC." },
      tags: ["ospf", "routing dinamico", "area 0", "router-id", "wildcard"]
    },
    {
      id: "pt-ospf-show", name: "show ip ospf neighbor / interface brief", os: "network", shell: "ios", category: "packettracer", risk: "safe",
      description: "Diagnóstico de OSPF: vecinos y su estado, interfaces participantes, costes y DR/BDR.",
      syntax: "show ip ospf neighbor | show ip ospf interface [brief] | show ip ospf database | show ip route ospf",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "FULL", description: "Adyacencia completa (correcto)." },
        { flag: "2WAY / INIT / EXSTART", description: "Problemas: DROTHERs, hellos, MTU o temporizadores distintos." },
        { flag: "show ip ospf interface brief", description: "Área, coste y estado (DR, BDR, P2P) por interfaz." },
        { flag: "show ip ospf database", description: "LSDB: LSA conocidos." }
      ],
      example: { command: "show ip ospf neighbor\nshow ip ospf interface brief\nshow ip route ospf", explanation: "Si no aparece el vecino, revisa área, máscara y temporizadores hello/dead en ambos extremos." },
      tags: ["ospf", "vecinos", "adyacencia", "diagnostico", "dr bdr"]
    },
    {
      id: "pt-ospf-tuning", name: "ip ospf cost / priority / default-information originate", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Ajustes de OSPF: coste de interfaz, prioridad para elegir DR, ancho de banda de referencia y propagación de la ruta por defecto.",
      syntax: "ip ospf cost N | ip ospf priority N | auto-cost reference-bandwidth M | default-information originate",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "ip ospf cost 10", description: "Coste manual (menor = preferido)." },
        { flag: "ip ospf priority 0", description: "Este router nunca será DR/BDR." },
        { flag: "auto-cost reference-bandwidth 10000", description: "Diferencia enlaces de 1 y 10 Gbps (igual en todos)." },
        { flag: "default-information originate", description: "Anuncia la ruta por defecto al resto." }
      ],
      example: { command: "configure terminal\nrouter ospf 1\n auto-cost reference-bandwidth 10000\n default-information originate\ninterface GigabitEthernet0/1\n ip ospf priority 255\nend", explanation: "R1, el router frontera con Internet, reparte la ruta por defecto por OSPF y se asegura de ser el DR del segmento." },
      tags: ["ospf", "coste", "dr", "ruta por defecto", "ajustes"]
    },
    {
      id: "pt-eigrp", name: "router eigrp / show ip eigrp neighbors", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "EIGRP (protocolo de Cisco): anuncia redes con wildcard, desactiva la sumarización automática y comprueba vecinos.",
      syntax: "router eigrp AS → network RED WILDCARD → no auto-summary | show ip eigrp neighbors | show ip eigrp topology",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "router eigrp 100", description: "Número de sistema autónomo (igual en todos los vecinos)." },
        { flag: "no auto-summary", description: "Evita resumir a la clase (problema con redes discontinuas)." },
        { flag: "passive-interface", description: "No forma vecinos en esa interfaz." },
        { flag: "show ip eigrp topology", description: "Sucesores y sucesores factibles." }
      ],
      example: { command: "configure terminal\nrouter eigrp 100\n network 192.168.10.0 0.0.0.255\n network 10.0.0.0 0.0.0.3\n no auto-summary\n passive-interface GigabitEthernet0/0\nend\nshow ip eigrp neighbors", explanation: "Alternativa a OSPF en la práctica de enrutamiento dinámico entre R1 y R2." },
      tags: ["eigrp", "routing dinamico", "sistema autonomo", "vecinos", "cisco"]
    },
    {
      id: "pt-rip", name: "router rip / version 2", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "RIPv2: protocolo de vector distancia sencillo para prácticas pequeñas (máximo 15 saltos).",
      syntax: "router rip → version 2 → network RED-CON-CLASE → no auto-summary",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "version 2", description: "Admite VLSM y envía por multicast." },
        { flag: "network 192.168.10.0", description: "Red con clase (sin máscara)." },
        { flag: "no auto-summary", description: "Necesario con subredes discontinuas." },
        { flag: "debug ip rip", description: "Ver las actualizaciones que se envían y reciben." }
      ],
      example: { command: "configure terminal\nrouter rip\n version 2\n network 192.168.10.0\n network 10.0.0.0\n no auto-summary\n passive-interface GigabitEthernet0/0\nend\nshow ip route rip", explanation: "Enrutamiento dinámico mínimo entre dos o tres routers de una práctica de introducción." },
      tags: ["rip", "ripv2", "vector distancia", "routing dinamico", "saltos"]
    },
    {
      id: "pt-bgp", name: "router bgp / neighbor remote-as", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "eBGP básico con un proveedor: vecino en otro sistema autónomo y anuncio de la red pública propia.",
      syntax: "router bgp AS → neighbor IP remote-as AS-VECINO → network RED mask MÁSCARA | show ip bgp summary",
      requires: "Cisco Packet Tracer 8.x (soporte BGP básico) o un router con Cisco IOS.",
      flags: [
        { flag: "router bgp 65001", description: "AS propio." },
        { flag: "neighbor … remote-as 65000", description: "Vecino eBGP (AS distinto)." },
        { flag: "network … mask …", description: "Anuncia una red que exista en la tabla de rutas." },
        { flag: "show ip bgp summary", description: "Estado de los vecinos (un número = prefijos recibidos)." }
      ],
      example: { command: "configure terminal\nrouter bgp 65001\n neighbor 203.0.113.1 remote-as 65000\n network 198.51.100.0 mask 255.255.255.0\nend\nshow ip bgp summary", explanation: "Práctica de conexión a un ISP: R1 anuncia la red pública de la empresa al proveedor por eBGP." },
      tags: ["bgp", "ebgp", "isp", "sistema autonomo", "internet"]
    },

    // ---- Servicios IP
    {
      id: "pt-dhcp-server", name: "ip dhcp pool / excluded-address", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Convierte el router en servidor DHCP de una VLAN: rango, puerta de enlace, DNS y direcciones reservadas.",
      syntax: "ip dhcp excluded-address INICIO FIN → ip dhcp pool NOMBRE → network RED MÁSCARA → default-router IP → dns-server IP",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "ip dhcp excluded-address", description: "IPs que no se reparten (routers, servidores, impresoras)." },
        { flag: "network", description: "Subred del pool." },
        { flag: "default-router / dns-server", description: "Puerta de enlace y DNS que reciben los clientes." },
        { flag: "show ip dhcp binding", description: "Concesiones entregadas (IP–MAC)." }
      ],
      example: { command: "configure terminal\nip dhcp excluded-address 192.168.10.1 192.168.10.20\nip dhcp pool VENTAS\n network 192.168.10.0 255.255.255.0\n default-router 192.168.10.1\n dns-server 8.8.8.8\n domain-name corp.local\nend\nshow ip dhcp binding", explanation: "Los PC de Ventas obtienen IP automáticamente; las 20 primeras quedan reservadas para equipos con IP fija. En el PC: Desktop → IP Configuration → DHCP." },
      tags: ["dhcp", "pool", "servidor dhcp", "excluded-address", "ip automatica"]
    },
    {
      id: "pt-dhcp-relay", name: "ip helper-address", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Reenvía las peticiones DHCP de una VLAN a un servidor DHCP situado en otra red (agente de retransmisión).",
      syntax: "interface Gi0/0.N → ip helper-address IP-SERVIDOR-DHCP",
      requires: "Cisco Packet Tracer 8.x o un router/switch L3 con Cisco IOS.",
      flags: [
        { flag: "ip helper-address", description: "En la interfaz o SVI que hace de puerta de enlace de los clientes." },
        { flag: "Pool en el servidor", description: "El servidor necesita un ámbito para cada subred." },
        { flag: "show ip interface | include Helper", description: "Comprueba el helper configurado." }
      ],
      example: { command: "configure terminal\ninterface GigabitEthernet0/0.20\n ip helper-address 192.168.99.10\nend", explanation: "Los PC de Contabilidad (VLAN 20) reciben IP del servidor DHCP central de la red de gestión." },
      tags: ["dhcp relay", "helper-address", "retransmision", "servidor central", "dhcp"]
    },
    {
      id: "pt-nat-static", name: "ip nat inside source static", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "NAT estático: publica un servidor interno en Internet asignándole una IP pública fija.",
      syntax: "ip nat inside source static IP-PRIVADA IP-PÚBLICA | interface X → ip nat inside | ip nat outside",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "ip nat inside", description: "Interfaz hacia la red interna." },
        { flag: "ip nat outside", description: "Interfaz hacia Internet." },
        { flag: "static … tcp 192.168.10.50 80 203.0.113.10 80", description: "Variante por puerto (port forwarding)." }
      ],
      example: { command: "configure terminal\nip nat inside source static 192.168.10.50 203.0.113.10\ninterface GigabitEthernet0/0\n ip nat inside\ninterface GigabitEthernet0/1\n ip nat outside\nend", explanation: "El servidor web interno 192.168.10.50 es accesible desde Internet en 203.0.113.10." },
      tags: ["nat", "nat estatico", "servidor", "ip publica", "port forwarding"]
    },
    {
      id: "pt-pat", name: "ip nat inside source list … overload (PAT)", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "PAT (NAT con sobrecarga): toda la red interna sale a Internet compartiendo la IP pública del router.",
      syntax: "access-list N permit RED WILDCARD → ip nat inside source list N interface IF overload",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "access-list 1 permit …", description: "Qué direcciones internas se traducen." },
        { flag: "interface Gi0/1 overload", description: "Usa la IP de la interfaz exterior con puertos distintos." },
        { flag: "ip nat pool … / list … pool …", description: "Alternativa con un rango de IPs públicas." }
      ],
      example: { command: "configure terminal\naccess-list 1 permit 192.168.10.0 0.0.0.255\naccess-list 1 permit 192.168.20.0 0.0.0.255\nip nat inside source list 1 interface GigabitEthernet0/1 overload\ninterface GigabitEthernet0/0\n ip nat inside\ninterface GigabitEthernet0/1\n ip nat outside\nend", explanation: "Ventas y Contabilidad navegan por Internet con la única IP pública del router frontera." },
      tags: ["pat", "nat overload", "internet", "nat", "ip publica"]
    },
    {
      id: "pt-nat-show", name: "show ip nat translations / statistics", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Comprueba que NAT funciona: traducciones activas, aciertos y fallos, e interfaces inside/outside.",
      syntax: "show ip nat translations | show ip nat statistics | clear ip nat translation *",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "Inside local / global", description: "IP privada / IP pública que la representa." },
        { flag: "show ip nat statistics", description: "Hits, misses e interfaces configuradas." },
        { flag: "clear ip nat translation *", description: "Borra las traducciones dinámicas (corta conexiones)." }
      ],
      example: { command: "show ip nat translations\nshow ip nat statistics", explanation: "Si no hay traducciones, revisa la ACL de NAT y que las interfaces inside y outside no estén invertidas." },
      tags: ["nat", "traducciones", "diagnostico", "pat", "estadisticas"]
    },
    {
      id: "pt-acl-standard", name: "access-list (ACL estándar)", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "ACL estándar numerada (1–99): filtra solo por IP de origen. Se aplica lo más cerca posible del destino.",
      syntax: "access-list N permit|deny ORIGEN WILDCARD | interface X → ip access-group N in|out",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "access-list 10 deny host 192.168.20.5", description: "Un único equipo (host = 0.0.0.0)." },
        { flag: "permit any", description: "Imprescindible al final: hay un deny any implícito." },
        { flag: "ip access-group 10 out", description: "Aplica la ACL a la interfaz en un sentido." },
        { flag: "remark texto", description: "Comentario dentro de la ACL." }
      ],
      example: { command: "configure terminal\naccess-list 10 remark Contabilidad no accede a la red de servidores\naccess-list 10 deny 192.168.20.0 0.0.0.255\naccess-list 10 permit any\ninterface GigabitEthernet0/2\n ip access-group 10 out\nend", explanation: "La red de Contabilidad no puede llegar a la LAN de servidores; el resto del tráfico sigue permitido." },
      tags: ["acl", "estandar", "filtrado", "access-list", "seguridad"]
    },
    {
      id: "pt-acl-extended", name: "ip access-list extended", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "ACL extendida con nombre: filtra por origen, destino, protocolo y puerto. Se aplica cerca del origen.",
      syntax: "ip access-list extended NOMBRE → permit|deny PROTO ORIGEN WC DESTINO WC [eq PUERTO] → interface X → ip access-group NOMBRE in",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "permit tcp … host 192.168.99.10 eq 443", description: "Protocolo, destino y puerto." },
        { flag: "eq 80 / range 20 21", description: "Puerto concreto o rango." },
        { flag: "permit icmp any any echo-reply", description: "Permite respuestas de ping." },
        { flag: "Número de secuencia (10, 20…)", description: "Permite insertar o borrar líneas concretas." }
      ],
      example: { command: "configure terminal\nip access-list extended VENTAS-IN\n permit tcp 192.168.10.0 0.0.0.255 host 192.168.99.10 eq 443\n permit udp 192.168.10.0 0.0.0.255 any eq 53\n deny ip 192.168.10.0 0.0.0.255 192.168.99.0 0.0.0.255\n permit ip any any\ninterface GigabitEthernet0/0.10\n ip access-group VENTAS-IN in\nend", explanation: "Ventas solo puede usar el servidor de gestión por HTTPS, resuelve DNS y navega con normalidad." },
      tags: ["acl", "extendida", "puertos", "filtrado", "firewall"]
    },
    {
      id: "pt-acl-vty", name: "access-class (restringir acceso SSH)", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Limita desde qué redes se puede administrar el equipo por SSH/Telnet aplicando una ACL a las líneas VTY.",
      syntax: "access-list N permit RED WILDCARD → line vty 0 15 → access-class N in",
      requires: "Cisco Packet Tracer 8.x o un equipo con Cisco IOS. Prueba desde una sesión de consola para no bloquearte.",
      flags: [
        { flag: "access-class 5 in", description: "Se aplica a las líneas, no a una interfaz." },
        { flag: "show line vty 0 15", description: "Comprueba la ACL aplicada." },
        { flag: "show access-lists 5", description: "Ver coincidencias (intentos permitidos/denegados)." }
      ],
      example: { command: "configure terminal\naccess-list 5 permit 192.168.99.0 0.0.0.255\nline vty 0 15\n access-class 5 in\nend", explanation: "Solo los equipos de la VLAN de gestión pueden abrir SSH contra el router." },
      tags: ["acl", "vty", "ssh", "gestion", "access-class"]
    },
    {
      id: "pt-show-acl", name: "show access-lists / show ip interface", os: "network", shell: "ios", category: "packettracer", risk: "safe",
      description: "Muestra las ACL con sus contadores de coincidencias y en qué interfaz y sentido está aplicada cada una.",
      syntax: "show access-lists [N|NOMBRE] | show ip interface IF | include access list",
      requires: "Cisco Packet Tracer 8.x o un equipo con Cisco IOS.",
      flags: [
        { flag: "(N match(es))", description: "Paquetes que han coincidido con cada línea." },
        { flag: "show ip interface g0/0", description: "ACL de entrada y salida de la interfaz." },
        { flag: "clear access-list counters", description: "Pone los contadores a cero para probar." }
      ],
      example: { command: "clear access-list counters\nshow access-lists VENTAS-IN\nshow ip interface GigabitEthernet0/0.10 | include access list", explanation: "Pon a cero los contadores, repite la prueba desde el PC y comprueba qué línea de la ACL está bloqueando el tráfico." },
      tags: ["acl", "contadores", "diagnostico", "access-group", "show"]
    },
    {
      id: "pt-hsrp", name: "standby (HSRP)", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Puerta de enlace redundante: dos routers comparten una IP virtual; si cae el activo, el otro toma el relevo.",
      syntax: "interface X → standby N ip IP-VIRTUAL → standby N priority P → standby N preempt | show standby brief",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "standby 1 ip 192.168.10.254", description: "IP virtual que usarán los PC como puerta de enlace." },
        { flag: "standby 1 priority 110", description: "Mayor prioridad = router activo." },
        { flag: "standby 1 preempt", description: "Recupera el papel de activo al volver." },
        { flag: "show standby brief", description: "Estado Active/Standby de cada grupo." }
      ],
      example: { command: "configure terminal\ninterface GigabitEthernet0/0\n ip address 192.168.10.2 255.255.255.0\n standby 1 ip 192.168.10.254\n standby 1 priority 110\n standby 1 preempt\nend\nshow standby brief", explanation: "R1 es el router activo de la VLAN 10; R2 se configura igual con prioridad 100 y toma el relevo si R1 cae." },
      tags: ["hsrp", "redundancia", "fhrp", "puerta de enlace", "alta disponibilidad"]
    },
    {
      id: "pt-snmp", name: "snmp-server community", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Habilita SNMP para que una herramienta de monitorización consulte el equipo, limitado por ACL.",
      syntax: "snmp-server community NOMBRE ro|rw [ACL] | snmp-server location | snmp-server contact",
      requires: "Cisco Packet Tracer 8.x (MIB Browser en un PC) o un equipo con Cisco IOS.",
      flags: [
        { flag: "community … ro", description: "Solo lectura (nunca uses rw sin necesidad)." },
        { flag: "… 5", description: "ACL con los equipos que pueden consultar." },
        { flag: "snmp-server location / contact", description: "Datos de inventario." }
      ],
      example: { command: "configure terminal\naccess-list 5 permit 192.168.99.10\nsnmp-server community M0n1tor! ro 5\nsnmp-server location CPD-Madrid-Rack3\nsnmp-server contact soporte@empresa.com\nend", explanation: "El servidor de monitorización puede leer el estado del router; nadie más puede consultarlo." },
      tags: ["snmp", "monitorizacion", "community", "mib", "gestion"]
    },
    {
      id: "pt-cdp-lldp", name: "cdp run / lldp run", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Activa o desactiva el descubrimiento de vecinos (CDP de Cisco, LLDP estándar), global o por interfaz.",
      syntax: "cdp run | no cdp run | lldp run | interface X → no cdp enable | show lldp neighbors",
      requires: "Cisco Packet Tracer 8.x o un equipo con Cisco IOS.",
      flags: [
        { flag: "no cdp run", description: "Desactiva CDP en todo el equipo." },
        { flag: "interface … no cdp enable", description: "Lo desactiva en un puerto (p. ej. hacia Internet)." },
        { flag: "lldp run", description: "Activa LLDP (multimarca)." },
        { flag: "show lldp neighbors detail", description: "Vecinos LLDP con IP y puerto." }
      ],
      example: { command: "configure terminal\nlldp run\ninterface GigabitEthernet0/1\n no cdp enable\nend\nshow lldp neighbors", explanation: "Buena práctica: no anunciar información del equipo por la interfaz hacia el ISP, y usar LLDP para descubrir equipos de otros fabricantes." },
      tags: ["cdp", "lldp", "vecinos", "descubrimiento", "seguridad"]
    },

    // ---- IPv6
    {
      id: "pt-ipv6", name: "ipv6 unicast-routing / ipv6 address", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Activa el enrutamiento IPv6 y asigna direcciones globales y link-local a las interfaces.",
      syntax: "ipv6 unicast-routing | interface X → ipv6 address PREFIJO/64 → ipv6 address FE80::1 link-local | show ipv6 interface brief",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "ipv6 unicast-routing", description: "Imprescindible para que el router enrute y envíe RA (SLAAC)." },
        { flag: "ipv6 address 2001:db8:acad:10::1/64", description: "Dirección global." },
        { flag: "… FE80::1 link-local", description: "Link-local fácil de reconocer." },
        { flag: "show ipv6 interface brief", description: "Direcciones IPv6 por interfaz." }
      ],
      example: { command: "configure terminal\nipv6 unicast-routing\ninterface GigabitEthernet0/0\n ipv6 address 2001:db8:acad:10::1/64\n ipv6 address FE80::1 link-local\n no shutdown\nend\nshow ipv6 interface brief", explanation: "Doble pila en la LAN de Ventas: los PC configurados en «Automatic» obtienen IPv6 por SLAAC." },
      tags: ["ipv6", "doble pila", "slaac", "link-local", "direccionamiento"]
    },
    {
      id: "pt-ipv6-route", name: "ipv6 route / show ipv6 route", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Rutas estáticas y por defecto en IPv6 y consulta de la tabla de enrutamiento IPv6.",
      syntax: "ipv6 route PREFIJO/LONG siguiente-salto|interfaz | ipv6 route ::/0 … | show ipv6 route",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS.",
      flags: [
        { flag: "ipv6 route ::/0 …", description: "Ruta por defecto IPv6." },
        { flag: "Siguiente salto link-local", description: "Necesita también la interfaz: Gi0/1 FE80::2." },
        { flag: "show ipv6 route static", description: "Solo las estáticas." }
      ],
      example: { command: "configure terminal\nipv6 route 2001:db8:acad:30::/64 2001:db8:acad:100::2\nipv6 route ::/0 GigabitEthernet0/1 FE80::2\nend\nshow ipv6 route", explanation: "Ruta hacia la LAN IPv6 de R2 y salida por defecto usando la link-local del vecino." },
      tags: ["ipv6", "ruta estatica", "ruta por defecto", "routing", "tabla de rutas"]
    },
    {
      id: "pt-ospfv3", name: "ipv6 router ospf / ipv6 ospf area", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "OSPFv3 para IPv6: se activa por interfaz y necesita un router-id en formato IPv4.",
      syntax: "ipv6 router ospf ID → router-id X.X.X.X | interface X → ipv6 ospf ID area A | show ipv6 ospf neighbor",
      requires: "Cisco Packet Tracer 8.x o un router con Cisco IOS; ipv6 unicast-routing activado.",
      flags: [
        { flag: "router-id 1.1.1.1", description: "Obligatorio si el router no tiene ninguna IPv4." },
        { flag: "ipv6 ospf 1 area 0", description: "Activa OSPFv3 en la interfaz (no hay comando network)." },
        { flag: "passive-interface", description: "Igual que en OSPFv2." },
        { flag: "show ipv6 ospf neighbor", description: "Vecinos OSPFv3." }
      ],
      example: { command: "configure terminal\nipv6 router ospf 1\n router-id 1.1.1.1\ninterface GigabitEthernet0/0\n ipv6 ospf 1 area 0\ninterface GigabitEthernet0/1\n ipv6 ospf 1 area 0\nend\nshow ipv6 ospf neighbor", explanation: "Enrutamiento dinámico IPv6 entre R1 y R2 en la práctica de doble pila." },
      tags: ["ospfv3", "ipv6", "routing dinamico", "area", "vecinos"]
    },

    // ---- Diagnóstico
    {
      id: "pt-ping-traceroute", name: "ping / traceroute (extendidos)", os: "network", shell: "ios", category: "packettracer", risk: "safe",
      description: "Pruebas de conectividad desde el router: ping simple, ping desde una interfaz de origen concreta y traceroute.",
      syntax: "ping IP [source IF] [repeat N] | ping (extendido, interactivo) | traceroute IP",
      requires: "Cisco Packet Tracer 8.x o un equipo con Cisco IOS.",
      flags: [
        { flag: "!!!!!", description: "Éxito; «.» = sin respuesta; «U» = destino inalcanzable." },
        { flag: "source Gi0/0", description: "Usa la IP de esa interfaz como origen (prueba la ruta de vuelta)." },
        { flag: "repeat 100", description: "Más paquetes para detectar pérdidas." },
        { flag: "traceroute", description: "Saltos hasta el destino." }
      ],
      example: { command: "ping 192.168.30.10 source GigabitEthernet0/0 repeat 20\ntraceroute 192.168.30.10", explanation: "El ping desde la LAN de R1 comprueba que R2 también sabe volver a ella, algo que un ping simple no prueba." },
      tags: ["ping", "traceroute", "conectividad", "diagnostico", "origen"]
    },
    {
      id: "pt-debug", name: "debug / terminal monitor / undebug all", os: "network", shell: "ios", category: "packettracer", risk: "caution",
      description: "Muestra en tiempo real lo que hace un proceso (OSPF, DHCP, NAT…). En equipos reales puede saturar la CPU: desactívalo siempre al terminar.",
      syntax: "debug ip ospf adj | debug ip dhcp server events | debug ip nat | terminal monitor | undebug all",
      requires: "Cisco Packet Tracer 8.x o un equipo con Cisco IOS (modo privilegiado).",
      flags: [
        { flag: "terminal monitor", description: "Muestra los debug también en sesiones SSH." },
        { flag: "debug ip ospf adj", description: "Formación de adyacencias OSPF." },
        { flag: "debug ip nat", description: "Cada traducción NAT." },
        { flag: "undebug all (u all)", description: "Desactiva todos los debug." }
      ],
      example: { command: "terminal monitor\ndebug ip dhcp server events\nundebug all", explanation: "Ver por qué un PC no obtiene IP: observa la petición y la respuesta DHCP y desactiva el debug al terminar." },
      tags: ["debug", "diagnostico", "tiempo real", "ospf", "dhcp"]
    },
    {
      id: "pt-show-arp", name: "show arp / show mac address-table dynamic", os: "network", shell: "ios", category: "packettracer", risk: "safe",
      description: "Tablas de resolución: IP–MAC conocidas por el router (ARP) y MAC aprendidas por el switch en cada puerto.",
      syntax: "show arp | show ip arp IF | show mac address-table dynamic | clear mac address-table dynamic",
      requires: "Cisco Packet Tracer 8.x o un equipo con Cisco IOS.",
      flags: [
        { flag: "show arp", description: "IP, MAC, interfaz y antigüedad de cada entrada." },
        { flag: "show mac address-table dynamic vlan 10", description: "MAC aprendidas en una VLAN." },
        { flag: "clear arp-cache", description: "Vacía la caché ARP del router." },
        { flag: "clear mac address-table dynamic", description: "Vacía la tabla MAC del switch." }
      ],
      example: { command: "show arp\nshow mac address-table dynamic vlan 10", explanation: "Sigue un paquete paso a paso: qué MAC tiene la IP del PC y por qué puerto del switch está conectado." },
      tags: ["arp", "mac", "tabla", "diagnostico", "capa 2"]
    },
    {
      id: "pt-password-recovery", name: "Recuperación de contraseña (confreg 0x2142)", os: "network", shell: "ios", category: "packettracer", risk: "danger",
      description: "Recupera el acceso a un router del que se ha perdido la contraseña arrancando sin cargar la configuración.",
      syntax: "rommon → confreg 0x2142 → reset → copy startup-config running-config → enable secret … → config-register 0x2102",
      requires: "Acceso físico por consola; interrumpir el arranque (Ctrl+Break) para entrar en ROMMON. Packet Tracer lo simula en los routers.",
      flags: [
        { flag: "confreg 0x2142", description: "Arranca ignorando la startup-config." },
        { flag: "copy startup-config running-config", description: "Carga la configuración (las interfaces quedan apagadas)." },
        { flag: "config-register 0x2102", description: "Vuelve al arranque normal. ¡No lo olvides!" },
        { flag: "no shutdown", description: "Reactiva las interfaces tras la recuperación." }
      ],
      example: { command: "rommon 1 > confreg 0x2142\nrommon 2 > reset\nRouter> enable\nRouter# copy startup-config running-config\nR1# configure terminal\nR1(config)# enable secret NuevaClave!2026\nR1(config)# config-register 0x2102\nR1(config)# end\nR1# copy running-config startup-config", explanation: "Recupera el router sin perder su configuración. Si olvidas volver al registro 0x2102, en el siguiente reinicio arrancará vacío." },
      tags: ["contraseña", "recuperacion", "rommon", "confreg", "acceso"]
    },

    // ---------------------------------------------------------------- Esenciales de Linux y Windows (v1.7.0)
    {
      id: "linux-passwd", name: "passwd", os: "linux", shell: "bash", category: "users", risk: "caution",
      description: "Cambia la contraseña de un usuario y bloquea o desbloquea la cuenta.",
      syntax: "passwd [-l|-u] [-e] [-S] [usuario]",
      flags: [
        { flag: "-l / -u", description: "Bloquea o desbloquea la contraseña de la cuenta." },
        { flag: "-e", description: "Caduca la contraseña: obliga a cambiarla en el próximo inicio." },
        { flag: "-S", description: "Muestra el estado de la contraseña (P, L o NP)." },
        { flag: "-d", description: "Deja la cuenta sin contraseña (peligroso)." }
      ],
      example: { command: "sudo passwd jlopez && sudo passwd -e jlopez && sudo passwd -S jlopez", explanation: "Restablece la contraseña de un usuario que la ha olvidado y le obliga a elegir una nueva al entrar." },
      tags: ["contraseña", "password", "bloquear", "cuenta", "restablecer"]
    },
    {
      id: "linux-userdel", name: "userdel", os: "linux", shell: "bash", category: "users", risk: "danger",
      description: "Elimina una cuenta de usuario y, opcionalmente, su directorio personal y su correo.",
      syntax: "userdel [-r] [-f] usuario",
      flags: [
        { flag: "-r", description: "Borra también el home y la cola de correo." },
        { flag: "-f", description: "Fuerza el borrado aunque el usuario tenga sesión abierta." }
      ],
      example: { command: "sudo tar -czf /root/bajas/aruiz-home.tar.gz /home/aruiz && sudo pkill -u aruiz; sudo userdel -r aruiz", explanation: "Baja de un empleado: guarda una copia de su home, cierra sus procesos y elimina la cuenta con sus archivos." },
      tags: ["borrar", "usuario", "baja", "eliminar", "cuenta"]
    },
    {
      id: "linux-groupadd", name: "groupadd / gpasswd", os: "linux", shell: "bash", category: "users", risk: "caution",
      description: "Crea grupos y gestiona sus miembros sin tocar el resto de grupos del usuario.",
      syntax: "groupadd [-g GID] grupo | gpasswd -a|-d usuario grupo",
      flags: [
        { flag: "-g 2001", description: "GID fijo, útil para que coincida entre servidores (NFS)." },
        { flag: "gpasswd -a", description: "Añade un usuario al grupo." },
        { flag: "gpasswd -d", description: "Quita un usuario del grupo." },
        { flag: "getent group", description: "Comprueba el grupo y sus miembros." }
      ],
      example: { command: "sudo groupadd -g 2001 contabilidad && sudo gpasswd -a aruiz contabilidad && getent group contabilidad", explanation: "Crea el grupo del departamento con un GID fijo y añade a una usuaria; el cambio se aplica en su próximo inicio de sesión." },
      tags: ["grupo", "miembros", "gid", "getent", "groupdel"]
    },
    {
      id: "linux-sudo-l", name: "sudo -l / su -", os: "linux", shell: "bash", category: "users", risk: "caution",
      description: "Muestra qué puede ejecutar un usuario con sudo y abre una sesión como otro usuario.",
      syntax: "sudo -l [-U usuario] | sudo -u usuario comando | su - usuario",
      flags: [
        { flag: "-l", description: "Lista los comandos permitidos por sudoers." },
        { flag: "-U usuario", description: "Consulta los permisos de otro usuario (como root)." },
        { flag: "-u usuario", description: "Ejecuta el comando como ese usuario." },
        { flag: "su -", description: "Sesión completa con el entorno del usuario destino." }
      ],
      example: { command: "sudo -l -U jlopez && sudo -u www-data test -w /var/www/html/uploads && echo \"www-data puede escribir\"", explanation: "Revisa los permisos de sudo de un usuario y comprueba, como el usuario del servidor web, si puede escribir en una carpeta." },
      tags: ["sudo", "sudoers", "permisos", "root", "privilegios", "su"]
    },
    {
      id: "linux-umask", name: "umask", os: "linux", shell: "bash", category: "users", risk: "caution",
      description: "Define los permisos por defecto de los archivos y carpetas nuevos.",
      syntax: "umask [-S] [máscara]",
      flags: [
        { flag: "-S", description: "Muestra la máscara en formato simbólico." },
        { flag: "022", description: "Archivos 644 y carpetas 755 (lo habitual)." },
        { flag: "027", description: "Sin acceso para «otros»: archivos 640 y carpetas 750." },
        { flag: "077", description: "Solo el propietario: archivos 600 y carpetas 700." }
      ],
      example: { command: "umask 027 && touch informe.txt && mkdir datos && ls -ld informe.txt datos", explanation: "Endurece la sesión para que lo nuevo no sea legible por otros usuarios. Para hacerlo permanente, ponlo en /etc/profile.d/ o en ~/.bashrc." },
      tags: ["permisos", "mascara", "defecto", "644", "755"]
    },
    {
      id: "linux-head-wc", name: "head / wc", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Muestra el principio de un archivo y cuenta líneas, palabras o bytes.",
      syntax: "head [-n N] archivo | wc [-l] [-w] [-c] archivo",
      flags: [
        { flag: "head -n 20", description: "Primeras 20 líneas." },
        { flag: "head -c 1K", description: "Primeros 1024 bytes." },
        { flag: "wc -l", description: "Cuenta líneas." },
        { flag: "wc -c", description: "Cuenta bytes." }
      ],
      example: { command: "head -n 5 /var/log/apache2/access.log && wc -l /var/log/apache2/access.log", explanation: "Echa un vistazo al formato de un log y cuenta cuántas peticiones tiene antes de procesarlo." },
      tags: ["primeras lineas", "contar", "lineas", "log"]
    },
    {
      id: "linux-sort-uniq", name: "sort / uniq", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Ordena líneas y cuenta las repetidas: la base de casi cualquier resumen de logs.",
      syntax: "sort [-n] [-r] [-k N] [-t sep] [-u] | uniq [-c] [-d]",
      flags: [
        { flag: "sort -n / -r", description: "Orden numérico / inverso." },
        { flag: "sort -k 2 -t ','", description: "Ordena por la segunda columna con «,» como separador." },
        { flag: "sort -h", description: "Entiende tamaños legibles (2K, 3M, 1G)." },
        { flag: "uniq -c", description: "Cuenta repeticiones (requiere entrada ordenada)." }
      ],
      example: { command: "awk '{print $1}' /var/log/apache2/access.log | sort | uniq -c | sort -rn | head -n 10", explanation: "Las 10 IP con más peticiones en el log de Apache: extrae la IP, agrupa, cuenta y ordena de mayor a menor." },
      tags: ["ordenar", "contar", "duplicados", "top", "ranking"]
    },
    {
      id: "linux-cut-tr", name: "cut / tr", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Extrae columnas de un texto y sustituye o elimina caracteres.",
      syntax: "cut -d sep -f campos | tr [-d] [-s] conjunto1 [conjunto2]",
      flags: [
        { flag: "cut -d: -f1,7", description: "Campos 1 y 7 con «:» como separador." },
        { flag: "cut -c1-10", description: "Caracteres del 1 al 10." },
        { flag: "tr 'a-z' 'A-Z'", description: "Convierte a mayúsculas." },
        { flag: "tr -d '\\r'", description: "Elimina retornos de carro de archivos de Windows." }
      ],
      example: { command: "cut -d: -f1,7 /etc/passwd | grep -v -e nologin -e false | tr ':' '\\t'", explanation: "Lista las cuentas que tienen una shell de inicio real, en dos columnas: una revisión rápida de quién puede entrar." },
      tags: ["columnas", "campos", "separador", "mayusculas", "csv"]
    },
    {
      id: "linux-tee", name: "tee", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Escribe la salida en un archivo y a la vez la muestra; con sudo permite escribir donde la redirección no llega.",
      syntax: "comando | tee [-a] archivo",
      flags: [
        { flag: "-a", description: "Añade al final en lugar de sobrescribir." },
        { flag: "sudo tee", description: "Escribe como root (la redirección > se haría sin privilegios)." },
        { flag: "> /dev/null", description: "Oculta la copia que saldría por pantalla." }
      ],
      example: { command: "echo \"vm.swappiness=10\" | sudo tee /etc/sysctl.d/99-swappiness.conf && sudo apt update 2>&1 | tee -a ~/mantenimiento.log", explanation: "Crea un archivo de configuración como root y guarda en un registro la salida de una actualización mientras la ves." },
      tags: ["redireccion", "guardar salida", "log", "sudo", "escribir"]
    },
    {
      id: "linux-zip", name: "zip / unzip", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Comprime y extrae archivos .zip, el formato que abre cualquier Windows.",
      syntax: "zip -r archivo.zip ruta [-x patrón] | unzip [-l] [-d destino] archivo.zip",
      requires: "sudo apt install zip unzip",
      flags: [
        { flag: "zip -r", description: "Incluye carpetas de forma recursiva." },
        { flag: "zip -x '*.log'", description: "Excluye lo que coincida con el patrón." },
        { flag: "unzip -l", description: "Lista el contenido sin extraer." },
        { flag: "unzip -d", description: "Carpeta de destino." }
      ],
      example: { command: "zip -r /tmp/informes-2026.zip /srv/informes -x '*.tmp' && unzip -l /tmp/informes-2026.zip | tail -n 3", explanation: "Empaqueta una carpeta para enviarla a un usuario de Windows y comprueba el contenido antes de mandarla." },
      tags: ["comprimir", "descomprimir", "zip", "extraer", "archivo"]
    },
    {
      id: "linux-gzip", name: "gzip / zcat / zgrep", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Comprime archivos y lee o busca dentro de los ya comprimidos, como los logs rotados.",
      syntax: "gzip [-k] [-9] archivo | zcat archivo.gz | zgrep patrón archivo.gz",
      flags: [
        { flag: "-k", description: "Conserva el archivo original." },
        { flag: "-9", description: "Máxima compresión (más lento)." },
        { flag: "-d", description: "Descomprime (igual que gunzip)." },
        { flag: "zgrep -c", description: "Cuenta coincidencias sin descomprimir." }
      ],
      example: { command: "zgrep -h \" 500 \" /var/log/apache2/access.log.*.gz | awk '{print $7}' | sort | uniq -c | sort -rn | head", explanation: "Busca errores 500 en los logs rotados de Apache sin descomprimirlos y muestra las rutas que más fallan." },
      tags: ["comprimir", "gz", "logs rotados", "gunzip", "buscar"]
    },
    {
      id: "linux-which", name: "which / whereis / command -v", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Localiza qué ejecutable se usará al escribir un comando y dónde están sus archivos.",
      syntax: "which [-a] comando | whereis comando | command -v comando",
      flags: [
        { flag: "which -a", description: "Todas las coincidencias en el PATH, no solo la primera." },
        { flag: "whereis", description: "Binario, fuentes y página de manual." },
        { flag: "command -v", description: "Forma portable para scripts; detecta alias y funciones." },
        { flag: "type -a", description: "Indica si es alias, función, integrado o archivo." }
      ],
      example: { command: "which -a python3 && command -v docker >/dev/null || echo \"docker no está instalado\"", explanation: "Averigua qué Python se ejecuta cuando hay varios instalados y comprueba en un script si existe una herramienta antes de usarla." },
      tags: ["ruta", "path", "ejecutable", "localizar", "type"]
    },
    {
      id: "linux-jq", name: "jq", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Filtra, transforma y da formato a JSON desde la línea de comandos.",
      syntax: "jq [-r] [-c] 'filtro' [archivo.json]",
      requires: "sudo apt install jq",
      flags: [
        { flag: "-r", description: "Salida en texto plano, sin comillas." },
        { flag: "-c", description: "Un objeto por línea (compacto)." },
        { flag: ".campo[]", description: "Recorre los elementos de un array." },
        { flag: "select(...)", description: "Filtra por una condición." }
      ],
      example: { command: "docker inspect $(docker ps -q) | jq -r '.[] | [.Name, .State.Status, .HostConfig.RestartPolicy.Name] | @tsv'", explanation: "Saca una tabla con el nombre, el estado y la política de reinicio de todos los contenedores en marcha." },
      tags: ["json", "api", "filtrar", "parsear", "formato"]
    },
    {
      id: "linux-ping", name: "ping", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Comprueba si un equipo responde por ICMP y mide la latencia y la pérdida de paquetes.",
      syntax: "ping [-c N] [-i seg] [-W seg] [-s bytes] [-M do] destino",
      flags: [
        { flag: "-c 4", description: "Envía 4 paquetes y termina." },
        { flag: "-i 0.2", description: "Intervalo entre paquetes." },
        { flag: "-W 1", description: "Tiempo de espera por respuesta, en segundos." },
        { flag: "-M do -s 1472", description: "Prohíbe fragmentar: sirve para probar la MTU." }
      ],
      example: { command: "ping -c 4 -W 1 srv01.corp.local && ping -c 2 -M do -s 1472 192.168.10.1", explanation: "Comprueba que un servidor responde y verifica que una MTU de 1500 pasa sin fragmentar hasta la puerta de enlace." },
      tags: ["icmp", "conectividad", "latencia", "mtu", "perdida de paquetes"]
    },
    {
      id: "linux-wget", name: "wget", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Descarga archivos por HTTP, HTTPS o FTP; reanuda descargas cortadas.",
      syntax: "wget [-c] [-O archivo] [-P carpeta] [-q] [--limit-rate=N] URL",
      flags: [
        { flag: "-c", description: "Reanuda una descarga interrumpida." },
        { flag: "-O archivo", description: "Nombre del archivo de salida." },
        { flag: "-P carpeta", description: "Carpeta de destino." },
        { flag: "--limit-rate=2m", description: "Limita el ancho de banda." }
      ],
      example: { command: "wget -c -P /tmp https://releases.ubuntu.com/24.04/SHA256SUMS && wget -q --spider https://empresa.com && echo \"web disponible\"", explanation: "Descarga un archivo con posibilidad de reanudarlo y comprueba, sin descargar nada, que una web responde." },
      tags: ["descargar", "http", "reanudar", "spider", "url"]
    },
    {
      id: "linux-ethtool", name: "ethtool", os: "linux", shell: "bash", category: "network", risk: "caution",
      description: "Consulta y ajusta la tarjeta de red: velocidad, dúplex, enlace y errores.",
      syntax: "ethtool [-i] [-S] [-s interfaz speed N duplex full] interfaz",
      requires: "sudo apt install ethtool",
      flags: [
        { flag: "(sin opciones)", description: "Velocidad, dúplex y si hay enlace." },
        { flag: "-i", description: "Controlador y versión del firmware." },
        { flag: "-S", description: "Contadores de errores y paquetes descartados." },
        { flag: "-s ... autoneg off", description: "Fija velocidad y dúplex a mano." }
      ],
      example: { command: "sudo ethtool ens18 | grep -E \"Speed|Duplex|Link detected\" && sudo ethtool -S ens18 | grep -iE \"err|drop\"", explanation: "Descarta un problema físico: comprueba que la tarjeta negocia a la velocidad esperada y que no acumula errores." },
      tags: ["tarjeta de red", "velocidad", "duplex", "enlace", "nic"]
    },
    {
      id: "linux-iperf3", name: "iperf3", os: "linux", shell: "bash", category: "network", risk: "caution",
      description: "Mide el ancho de banda real entre dos equipos generando tráfico de prueba.",
      syntax: "iperf3 -s | iperf3 -c servidor [-t seg] [-P N] [-R] [-u -b 100M]",
      requires: "sudo apt install iperf3 (en los dos equipos)",
      flags: [
        { flag: "-s", description: "Modo servidor (escucha en el puerto 5201)." },
        { flag: "-c servidor", description: "Modo cliente contra ese servidor." },
        { flag: "-P 4", description: "Cuatro flujos en paralelo." },
        { flag: "-R", description: "Prueba en sentido inverso (del servidor al cliente)." }
      ],
      example: { command: "iperf3 -c srv02 -t 10 -P 4 && iperf3 -c srv02 -t 10 -R", explanation: "Con «iperf3 -s» ya en marcha en srv02, mide la velocidad en los dos sentidos. Hazlo fuera de horas punta: satura el enlace." },
      tags: ["ancho de banda", "velocidad", "rendimiento", "throughput", "prueba"]
    },
    {
      id: "linux-resolvectl", name: "resolvectl", os: "linux", shell: "bash", category: "network", risk: "caution",
      description: "Muestra qué servidores DNS usa cada interfaz con systemd-resolved y vacía su caché.",
      syntax: "resolvectl status [interfaz] | query nombre | flush-caches | statistics",
      flags: [
        { flag: "status", description: "DNS y dominios de búsqueda por interfaz." },
        { flag: "query nombre", description: "Resuelve un nombre usando la configuración real del sistema." },
        { flag: "flush-caches", description: "Vacía la caché DNS local." },
        { flag: "statistics", description: "Aciertos y fallos de la caché." }
      ],
      example: { command: "resolvectl status ens18 && sudo resolvectl flush-caches && resolvectl query srv01.corp.local", explanation: "Tras cambiar un registro DNS, comprueba qué servidor consulta la máquina, vacía la caché y resuelve de nuevo." },
      tags: ["dns", "cache", "systemd-resolved", "resolv.conf", "resolver"]
    },
    {
      id: "linux-netplan", name: "netplan", os: "linux", shell: "bash", category: "network", risk: "danger",
      description: "Aplica la configuración de red de Ubuntu definida en YAML en /etc/netplan/.",
      syntax: "netplan try [--timeout seg] | apply | get | status",
      flags: [
        { flag: "try", description: "Aplica y revierte solo si no confirmas: evita quedarte sin acceso." },
        { flag: "apply", description: "Aplica la configuración sin vuelta atrás." },
        { flag: "get", description: "Muestra la configuración combinada." },
        { flag: "status", description: "Estado real de las interfaces." }
      ],
      example: { command: "sudo cp /etc/netplan/50-cloud-init.yaml /root/50-cloud-init.yaml.bak && sudo netplan try --timeout 60", explanation: "Cambia la IP de un servidor remoto con red de seguridad: si pierdes la conexión y no confirmas en 60 segundos, vuelve la configuración anterior." },
      tags: ["ip estatica", "ubuntu", "yaml", "configurar red", "interfaz"]
    },
    {
      id: "linux-pgrep", name: "pgrep / pidof", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Busca procesos por nombre, usuario o línea de comandos y devuelve sus PID.",
      syntax: "pgrep [-a] [-f] [-u usuario] [-c] patrón | pidof programa",
      flags: [
        { flag: "-a", description: "Muestra también la línea de comandos." },
        { flag: "-f", description: "Busca en toda la línea de comandos, no solo en el nombre." },
        { flag: "-u usuario", description: "Solo los procesos de ese usuario." },
        { flag: "-c", description: "Solo cuenta cuántos hay." }
      ],
      example: { command: "pgrep -a -u www-data apache2 | head -n 5 && pgrep -c apache2", explanation: "Comprueba que Apache está en marcha, bajo qué usuario y con cuántos procesos, sin el ruido de «ps | grep»." },
      tags: ["pid", "buscar proceso", "nombre", "contar"]
    },
    {
      id: "linux-strace", name: "strace", os: "linux", shell: "bash", category: "processes", risk: "caution",
      description: "Muestra las llamadas al sistema de un proceso: revela qué archivo no encuentra o dónde se queda colgado.",
      syntax: "strace [-f] [-p PID] [-e trace=tipo] [-o archivo] [-c] comando",
      requires: "sudo apt install strace",
      flags: [
        { flag: "-p PID", description: "Se engancha a un proceso en marcha." },
        { flag: "-f", description: "Sigue también a los procesos hijos." },
        { flag: "-e trace=openat,connect", description: "Solo aperturas de archivos y conexiones." },
        { flag: "-c", description: "Resumen con el tiempo por llamada." }
      ],
      example: { command: "sudo strace -f -e trace=openat -o /tmp/traza.txt /usr/local/bin/backup.sh; grep ENOENT /tmp/traza.txt | tail", explanation: "Un script falla sin dar un error claro: la traza muestra qué archivos intenta abrir y no existen. Ralentiza el proceso; no lo dejes puesto en producción." },
      tags: ["depurar", "syscall", "colgado", "enoent", "diagnostico"]
    },
    {
      id: "linux-nohup", name: "nohup / jobs / fg / bg", os: "linux", shell: "bash", category: "processes", risk: "caution",
      description: "Lanza tareas que sobreviven al cierre de la sesión y gestiona las que están en segundo plano.",
      syntax: "nohup comando > salida.log 2>&1 & | jobs -l | fg %N | bg %N | disown -h %N",
      flags: [
        { flag: "nohup ... &", description: "En segundo plano e inmune al cierre del terminal." },
        { flag: "jobs -l", description: "Lista las tareas de la sesión con su PID." },
        { flag: "Ctrl+Z, bg", description: "Pausa la tarea en curso y la reanuda en segundo plano." },
        { flag: "disown -h", description: "Desvincula una tarea ya lanzada para que no muera al salir." }
      ],
      example: { command: "nohup rsync -a /srv/datos/ backup@srv02:/backups/datos/ > ~/rsync.log 2>&1 & jobs -l", explanation: "Lanza una copia larga por SSH que seguirá aunque se corte la conexión. Para trabajos interactivos es mejor tmux." },
      tags: ["segundo plano", "background", "sesion", "desconectar", "tareas"]
    },
    {
      id: "linux-lscpu", name: "lscpu / dmidecode", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Inventario de hardware: procesador, memoria instalada, fabricante y número de serie.",
      syntax: "lscpu | lsmem | dmidecode -t system|memory|bios | dmidecode -s system-serial-number",
      flags: [
        { flag: "lscpu", description: "Modelo, núcleos, hilos y virtualización." },
        { flag: "dmidecode -t memory", description: "Módulos de RAM instalados y ranuras libres." },
        { flag: "dmidecode -t system", description: "Fabricante, modelo y número de serie." },
        { flag: "lsmem", description: "Memoria total que ve el sistema." }
      ],
      example: { command: "lscpu | grep -E \"Model name|^CPU\\(s\\)|Hypervisor\" && sudo dmidecode -t memory | grep -E \"Size|Speed|Locator\" | grep -v Bank", explanation: "Antes de pedir una ampliación de RAM, comprueba cuántos módulos hay, de qué tamaño y qué ranuras quedan libres." },
      tags: ["hardware", "cpu", "ram", "inventario", "numero de serie"]
    },
    {
      id: "linux-ulimit", name: "ulimit", os: "linux", shell: "bash", category: "processes", risk: "caution",
      description: "Consulta y ajusta los límites de recursos de la sesión: archivos abiertos, procesos, memoria.",
      syntax: "ulimit [-a] [-n N] [-u N] [-S|-H]",
      flags: [
        { flag: "-a", description: "Muestra todos los límites." },
        { flag: "-n", description: "Número máximo de archivos abiertos." },
        { flag: "-u", description: "Número máximo de procesos del usuario." },
        { flag: "-S / -H", description: "Límite blando / duro." }
      ],
      example: { command: "ulimit -n && grep \"open files\" /proc/$(pgrep -o mariadbd)/limits", explanation: "Ante un error «Too many open files», compara el límite de tu sesión con el que tiene de verdad el servicio. En servicios de systemd se cambia con LimitNOFILE." },
      tags: ["limites", "archivos abiertos", "nofile", "too many open files"]
    },
    {
      id: "linux-timedatectl", name: "timedatectl", os: "linux", shell: "bash", category: "processes", risk: "caution",
      description: "Consulta y configura la hora, la zona horaria y la sincronización NTP.",
      syntax: "timedatectl [status] | set-timezone Zona | set-ntp true | timesync-status",
      flags: [
        { flag: "status", description: "Hora local, UTC, zona y si está sincronizado." },
        { flag: "set-timezone", description: "Cambia la zona horaria." },
        { flag: "set-ntp true", description: "Activa la sincronización automática." },
        { flag: "timesync-status", description: "Servidor NTP en uso y desfase." }
      ],
      example: { command: "sudo timedatectl set-timezone Europe/Madrid && sudo timedatectl set-ntp true && timedatectl status", explanation: "Pone la zona horaria correcta y activa NTP: una hora desfasada rompe Kerberos, los certificados y la correlación de logs." },
      tags: ["hora", "zona horaria", "ntp", "reloj", "sincronizar"]
    },
    {
      id: "linux-shutdown", name: "shutdown / reboot", os: "linux", shell: "bash", category: "processes", risk: "danger",
      description: "Apaga o reinicia el equipo, de inmediato o programado, avisando a los usuarios conectados.",
      syntax: "shutdown [-r|-h] [+min|hh:mm|now] [mensaje] | shutdown -c | reboot",
      flags: [
        { flag: "-r", description: "Reinicia." },
        { flag: "-h", description: "Apaga." },
        { flag: "+10 / 23:00", description: "En 10 minutos / a una hora concreta." },
        { flag: "-c", description: "Cancela un apagado programado." }
      ],
      example: { command: "sudo shutdown -r 23:00 \"Reinicio por actualización del kernel. Guarda tu trabajo.\"", explanation: "Programa el reinicio para la ventana de mantenimiento y avisa a quien tenga sesión abierta. Si cambian los planes, «sudo shutdown -c» lo cancela." },
      tags: ["apagar", "reiniciar", "programar", "poweroff", "mantenimiento"]
    },
    {
      id: "linux-sysctl", name: "sysctl", os: "linux", shell: "bash", category: "processes", risk: "caution",
      description: "Lee y cambia parámetros del kernel en caliente: red, memoria y límites.",
      syntax: "sysctl [-a] [parámetro] | sysctl -w parámetro=valor | sysctl --system",
      flags: [
        { flag: "-a", description: "Lista todos los parámetros." },
        { flag: "-w", description: "Cambia un valor hasta el próximo reinicio." },
        { flag: "--system", description: "Recarga los archivos de /etc/sysctl.d/." },
        { flag: "-p archivo", description: "Carga un archivo concreto." }
      ],
      example: { command: "sysctl net.ipv4.ip_forward vm.swappiness && echo \"net.ipv4.ip_forward=1\" | sudo tee /etc/sysctl.d/99-router.conf && sudo sysctl --system", explanation: "Activa el reenvío de paquetes de forma permanente para que el servidor pueda enrutar o hacer NAT." },
      tags: ["kernel", "parametros", "ip_forward", "swappiness", "tuning"]
    },
    {
      id: "linux-env", name: "env / export", os: "linux", shell: "bash", category: "processes", risk: "caution",
      description: "Muestra y define variables de entorno para la sesión o para un único comando.",
      syntax: "env | printenv VAR | export VAR=valor | VAR=valor comando | unset VAR",
      flags: [
        { flag: "env", description: "Lista todas las variables de entorno." },
        { flag: "export", description: "Hace que la variable pase a los procesos hijos." },
        { flag: "VAR=valor comando", description: "La define solo para ese comando." },
        { flag: "env -i", description: "Ejecuta con un entorno vacío (como cron)." }
      ],
      example: { command: "export HTTPS_PROXY=http://proxy.corp.local:3128 && env | grep -i proxy && env -i /bin/bash -c /usr/local/bin/backup.sh", explanation: "Configura el proxy de la sesión y prueba un script con el entorno vacío para reproducir por qué falla desde cron." },
      tags: ["variables", "entorno", "path", "proxy", "printenv"]
    },
    {
      id: "linux-selinux", name: "getenforce / setenforce / restorecon", os: "linux", shell: "bash", category: "security", risk: "caution",
      description: "Consulta el modo de SELinux, lo cambia temporalmente y repara los contextos de archivos.",
      syntax: "getenforce | setenforce 0|1 | restorecon -Rv ruta | sestatus",
      flags: [
        { flag: "getenforce", description: "Enforcing, Permissive o Disabled." },
        { flag: "setenforce 0", description: "Modo permisivo hasta el reinicio: registra pero no bloquea." },
        { flag: "restorecon -Rv", description: "Restaura el contexto correcto de los archivos." },
        { flag: "ls -Z", description: "Muestra el contexto de un archivo." }
      ],
      example: { command: "getenforce && sudo ausearch -m avc -ts recent | tail -n 5; sudo restorecon -Rv /var/www/html", explanation: "Apache devuelve 403 en RHEL o Rocky aunque los permisos son correctos: revisa las denegaciones recientes y repara el contexto de la carpeta web." },
      tags: ["selinux", "contexto", "403", "rhel", "avc", "permisivo"]
    },
    {
      id: "linux-gpg", name: "gpg", os: "linux", shell: "bash", category: "security", risk: "caution",
      description: "Cifra, descifra, firma y verifica archivos con claves o con contraseña.",
      syntax: "gpg -c archivo | gpg -d archivo.gpg | gpg --verify firma archivo | gpg -e -r destinatario archivo",
      flags: [
        { flag: "-c", description: "Cifrado simétrico con contraseña." },
        { flag: "-e -r", description: "Cifra con la clave pública del destinatario." },
        { flag: "-d", description: "Descifra." },
        { flag: "--verify", description: "Comprueba una firma." }
      ],
      example: { command: "gpg -c --cipher-algo AES256 /root/backup-bd-20261108.sql.gz && rm /root/backup-bd-20261108.sql.gz", explanation: "Cifra una copia de la base de datos antes de subirla a un almacenamiento externo; pide la contraseña y genera el archivo .gpg." },
      tags: ["cifrar", "firma", "pgp", "verificar", "clave"]
    },
    {
      id: "linux-faillock", name: "faillock", os: "linux", shell: "bash", category: "security", risk: "caution",
      description: "Muestra y borra los bloqueos de cuenta por intentos fallidos de inicio de sesión.",
      syntax: "faillock [--user usuario] [--reset]",
      flags: [
        { flag: "(sin opciones)", description: "Intentos fallidos de todos los usuarios." },
        { flag: "--user", description: "Solo los de un usuario." },
        { flag: "--reset", description: "Borra el contador y desbloquea la cuenta." }
      ],
      example: { command: "sudo faillock --user jlopez && sudo faillock --user jlopez --reset", explanation: "Un usuario no puede entrar tras equivocarse varias veces: revisa desde dónde vinieron los intentos y desbloquea la cuenta." },
      tags: ["bloqueo", "intentos fallidos", "desbloquear", "pam", "login"]
    },
    {
      id: "linux-nft", name: "nft", os: "linux", shell: "bash", category: "security", risk: "danger",
      description: "Gestiona nftables, el cortafuegos que sustituye a iptables en las distribuciones actuales.",
      syntax: "nft list ruleset | nft add rule familia tabla cadena regla | nft -f archivo | nft -c -f archivo",
      flags: [
        { flag: "list ruleset", description: "Muestra todas las reglas activas." },
        { flag: "-a", description: "Añade el identificador de cada regla (para borrarla)." },
        { flag: "-c -f", description: "Comprueba un archivo sin aplicarlo." },
        { flag: "-f", description: "Carga las reglas de un archivo." }
      ],
      example: { command: "sudo nft -c -f /etc/nftables.conf && sudo nft -f /etc/nftables.conf && sudo nft -a list ruleset | head -n 30", explanation: "Valida la sintaxis del archivo de reglas antes de cargarlo. Una regla mal puesta puede cortarte el SSH: ten una consola alternativa." },
      tags: ["cortafuegos", "firewall", "nftables", "reglas", "iptables"]
    },
    {
      id: "linux-date", name: "date", os: "linux", shell: "bash", category: "automation", risk: "safe",
      description: "Muestra la fecha con el formato que necesites y calcula fechas relativas para scripts.",
      syntax: "date [+formato] [-d \"expresión\"] [-u] [-r archivo]",
      flags: [
        { flag: "+%F_%H%M", description: "Formato 2026-11-08_0915, ideal para nombres de archivo." },
        { flag: "-d \"7 days ago\"", description: "Fecha relativa." },
        { flag: "+%s", description: "Segundos desde 1970 (para restar fechas)." },
        { flag: "-u", description: "En UTC." }
      ],
      example: { command: "tar -czf /backups/web-$(date +%F).tar.gz /var/www/html && find /backups -name \"web-*.tar.gz\" -mtime +7 -delete", explanation: "Copia diaria con la fecha en el nombre y borrado de las que tienen más de una semana." },
      tags: ["fecha", "formato", "timestamp", "backup", "script"]
    },
    {
      id: "linux-ansible", name: "ansible (ad-hoc)", os: "linux", shell: "bash", category: "automation", risk: "caution",
      description: "Ejecuta una orden o un módulo en muchos servidores a la vez por SSH, sin instalar agentes.",
      syntax: "ansible grupo -i inventario -m módulo [-a argumentos] [-b] [--check]",
      requires: "sudo apt install ansible",
      flags: [
        { flag: "-m ping", description: "Comprueba el acceso por SSH y que hay Python." },
        { flag: "-a \"comando\"", description: "Argumentos del módulo o la orden que se ejecuta." },
        { flag: "-b", description: "Eleva privilegios con sudo." },
        { flag: "--check", description: "Simula sin cambiar nada." }
      ],
      example: { command: "ansible web -i inventario.ini -m ping && ansible web -i inventario.ini -b -m apt -a \"name=apache2 state=latest update_cache=yes\" --check", explanation: "Comprueba que llegas a todos los servidores web y simula la actualización de Apache en todos antes de aplicarla." },
      tags: ["automatizacion", "inventario", "ssh", "varios servidores", "playbook"]
    },
    {
      id: "linux-fdisk", name: "fdisk / parted", os: "linux", shell: "bash", category: "storage", risk: "danger",
      description: "Consulta y modifica la tabla de particiones de un disco.",
      syntax: "fdisk -l [disco] | parted -s disco print | parted -s disco mklabel gpt mkpart nombre ext4 1MiB 100%",
      flags: [
        { flag: "fdisk -l", description: "Lista discos y particiones (solo lectura)." },
        { flag: "parted -s", description: "Modo no interactivo, para scripts." },
        { flag: "mklabel gpt", description: "Crea una tabla GPT nueva: borra la anterior." },
        { flag: "mkpart", description: "Crea una partición." }
      ],
      example: { command: "sudo fdisk -l /dev/sdb && sudo parted -s /dev/sdb mklabel gpt mkpart datos ext4 1MiB 100% && lsblk /dev/sdb", explanation: "Prepara un disco nuevo con una única partición GPT. Confirma con «fdisk -l» que es el disco correcto: mklabel destruye lo que hubiera." },
      tags: ["particion", "gpt", "disco nuevo", "tabla de particiones", "mbr"]
    },
    {
      id: "linux-lvcreate", name: "pvcreate / vgcreate / lvcreate", os: "linux", shell: "bash", category: "storage", risk: "danger",
      description: "Crea almacenamiento LVM desde cero: volumen físico, grupo de volúmenes y volumen lógico.",
      syntax: "pvcreate disco | vgcreate grupo disco | lvcreate -n nombre -L tamaño|-l 100%FREE grupo | pvs | vgs | lvs",
      flags: [
        { flag: "pvcreate", description: "Marca un disco o partición para LVM." },
        { flag: "vgcreate", description: "Agrupa volúmenes físicos." },
        { flag: "lvcreate -L 50G", description: "Volumen lógico de 50 GB." },
        { flag: "pvs / vgs / lvs", description: "Resumen de cada nivel." }
      ],
      example: { command: "sudo pvcreate /dev/sdb1 && sudo vgcreate vg_datos /dev/sdb1 && sudo lvcreate -n lv_web -L 50G vg_datos && sudo mkfs.ext4 /dev/vg_datos/lv_web", explanation: "Monta un volumen de 50 GB para la web y deja el resto del grupo libre para ampliarlo en caliente cuando haga falta." },
      tags: ["lvm", "volumen logico", "grupo de volumenes", "pvs", "vgs", "lvs"]
    },
    {
      id: "linux-findmnt", name: "findmnt", os: "linux", shell: "bash", category: "storage", risk: "safe",
      description: "Muestra qué está montado y dónde, y valida /etc/fstab antes de reiniciar.",
      syntax: "findmnt [ruta|dispositivo] [-t tipo] [--verify] [--fstab]",
      flags: [
        { flag: "(sin opciones)", description: "Árbol de todos los puntos de montaje." },
        { flag: "-t ext4,xfs", description: "Filtra por tipo de sistema de archivos." },
        { flag: "--verify", description: "Comprueba que /etc/fstab no tiene errores." },
        { flag: "-T ruta", description: "Sistema de archivos que contiene esa ruta." }
      ],
      example: { command: "sudo findmnt --verify && findmnt -T /var/www/html", explanation: "Tras editar /etc/fstab, comprueba que no hay errores (un fallo puede impedir el arranque) y confirma en qué volumen vive la web." },
      tags: ["montaje", "fstab", "verificar", "punto de montaje"]
    },
    {
      id: "linux-resize2fs", name: "resize2fs / xfs_growfs", os: "linux", shell: "bash", category: "storage", risk: "caution",
      description: "Amplía un sistema de archivos para que ocupe todo el espacio de su partición o volumen.",
      syntax: "growpart disco N | resize2fs dispositivo | xfs_growfs punto_de_montaje",
      flags: [
        { flag: "growpart /dev/sda 2", description: "Amplía la partición 2 al espacio libre del disco." },
        { flag: "resize2fs", description: "Amplía ext4 (en caliente)." },
        { flag: "xfs_growfs", description: "Amplía XFS; se indica el punto de montaje." },
        { flag: "df -h", description: "Comprueba el resultado." }
      ],
      example: { command: "sudo growpart /dev/sda 2 && sudo resize2fs /dev/sda2 && df -h /", explanation: "Tras ampliar el disco de una máquina virtual, extiende la partición y el sistema de archivos sin desmontar ni reiniciar." },
      tags: ["ampliar disco", "crecer", "ext4", "xfs", "growpart"]
    },
    {
      id: "linux-snap", name: "snap", os: "linux", shell: "bash", category: "packages", risk: "caution",
      description: "Instala y actualiza paquetes snap, con sus dependencias incluidas y versiones por canal.",
      syntax: "snap list | find nombre | install nombre [--channel=canal] | refresh | revert nombre | remove nombre",
      flags: [
        { flag: "list", description: "Paquetes instalados y su versión." },
        { flag: "refresh --list", description: "Actualizaciones pendientes." },
        { flag: "revert", description: "Vuelve a la versión anterior." },
        { flag: "refresh --hold=72h", description: "Aplaza las actualizaciones automáticas." }
      ],
      example: { command: "snap list && sudo snap refresh --list && sudo snap refresh --hold=72h", explanation: "Revisa qué snaps hay y qué se va a actualizar, y aplaza tres días las actualizaciones automáticas para que no coincidan con un despliegue." },
      tags: ["paquetes", "snapd", "actualizar", "canal", "revertir"]
    },
    {
      id: "linux-apt-mark", name: "apt-mark", os: "linux", shell: "bash", category: "packages", risk: "caution",
      description: "Retiene paquetes para que no se actualicen y marca cuáles se instalaron a mano.",
      syntax: "apt-mark hold|unhold paquete | showhold | showmanual",
      flags: [
        { flag: "hold", description: "Bloquea la versión actual del paquete." },
        { flag: "unhold", description: "Quita el bloqueo." },
        { flag: "showhold", description: "Lista los paquetes retenidos." },
        { flag: "showmanual", description: "Paquetes instalados expresamente." }
      ],
      example: { command: "sudo apt-mark hold mariadb-server && apt-mark showhold", explanation: "Evita que una actualización general cambie la versión de la base de datos hasta que la hayas probado. Acuérdate de quitar el bloqueo: retiene también los parches de seguridad." },
      tags: ["retener", "bloquear version", "hold", "paquete"]
    },
    {
      id: "linux-unattended-upgrade", name: "unattended-upgrade", os: "linux", shell: "bash", category: "packages", risk: "caution",
      description: "Instala solo las actualizaciones de seguridad, de forma automática o a demanda.",
      syntax: "unattended-upgrade [--dry-run] [-d] | dpkg-reconfigure -plow unattended-upgrades",
      flags: [
        { flag: "--dry-run", description: "Muestra qué instalaría sin hacerlo." },
        { flag: "-d", description: "Salida detallada." },
        { flag: "dpkg-reconfigure", description: "Activa o desactiva la ejecución diaria." }
      ],
      example: { command: "sudo unattended-upgrade --dry-run -d 2>&1 | grep -E \"Checking|Packages that will be upgraded\" | tail -n 5", explanation: "Comprueba qué parches de seguridad se instalarían esta noche. El registro queda en /var/log/unattended-upgrades/." },
      tags: ["parches", "seguridad", "automatico", "actualizaciones"]
    },
    {
      id: "linux-git-clone", name: "git clone / remote", os: "linux", shell: "bash", category: "git", risk: "safe",
      description: "Descarga un repositorio y gestiona los servidores remotos con los que se sincroniza.",
      syntax: "git clone [--depth N] [-b rama] URL [carpeta] | git remote -v | git remote set-url origin URL",
      flags: [
        { flag: "--depth 1", description: "Solo el último commit: descarga rápida." },
        { flag: "-b rama", description: "Clona y se sitúa en esa rama." },
        { flag: "remote -v", description: "Muestra las URL de los remotos." },
        { flag: "remote set-url", description: "Cambia la URL, por ejemplo de HTTPS a SSH." }
      ],
      example: { command: "git clone --depth 1 -b main git@github.com:empresa/infra.git /opt/infra && git -C /opt/infra remote -v", explanation: "Trae al servidor la última versión del repositorio de infraestructura sin todo su historial." },
      tags: ["clonar", "repositorio", "remoto", "origin", "descargar"]
    },
    {
      id: "linux-git-branch", name: "git branch / switch / merge", os: "linux", shell: "bash", category: "git", risk: "caution",
      description: "Crea ramas, cambia entre ellas y fusiona el trabajo terminado.",
      syntax: "git switch [-c] rama | git branch [-a] [-d rama] | git merge [--no-ff] rama",
      flags: [
        { flag: "switch -c", description: "Crea una rama y se cambia a ella." },
        { flag: "branch -a", description: "Lista las ramas locales y remotas." },
        { flag: "merge --no-ff", description: "Fusiona dejando un commit de fusión visible." },
        { flag: "branch -d", description: "Borra una rama ya fusionada." }
      ],
      example: { command: "git switch -c fix/vhost-ssl && git add sites/web.conf && git commit -m \"Corrige el certificado del vhost\" && git switch main && git merge --no-ff fix/vhost-ssl", explanation: "Hace un cambio de configuración en su propia rama y lo incorpora a main dejando constancia en el historial." },
      tags: ["rama", "fusionar", "checkout", "branch", "merge"]
    },
    {
      id: "linux-git-tag", name: "git tag", os: "linux", shell: "bash", category: "git", risk: "caution",
      description: "Marca un commit con un nombre de versión para poder desplegarlo o volver a él.",
      syntax: "git tag [-a nombre -m mensaje] [commit] | git tag -l patrón | git push origin nombre",
      flags: [
        { flag: "-a -m", description: "Etiqueta anotada, con autor, fecha y mensaje." },
        { flag: "-l \"v1.*\"", description: "Lista las etiquetas que coinciden." },
        { flag: "push origin nombre", description: "Sube la etiqueta al remoto (no va con un push normal)." },
        { flag: "-d", description: "Borra una etiqueta local." }
      ],
      example: { command: "git tag -a v2.4.0 -m \"Versión desplegada el 8 de noviembre\" && git push origin v2.4.0", explanation: "Deja marcada la versión que acabas de desplegar: si algo falla, sabes exactamente a qué commit volver." },
      tags: ["etiqueta", "version", "release", "despliegue"]
    },
    {
      id: "linux-qm", name: "qm / pct (Proxmox)", os: "linux", shell: "bash", category: "virtualization", risk: "caution",
      description: "Gestiona máquinas virtuales (qm) y contenedores LXC (pct) desde la consola de un nodo Proxmox VE.",
      syntax: "qm list | qm start|shutdown|stop ID | qm snapshot ID nombre | qm config ID | pct list | pct enter ID",
      requires: "Nodo con Proxmox VE",
      flags: [
        { flag: "qm list", description: "Máquinas del nodo y su estado." },
        { flag: "qm shutdown", description: "Apagado ordenado; «stop» corta la alimentación." },
        { flag: "qm snapshot", description: "Instantánea antes de un cambio." },
        { flag: "pct enter", description: "Abre una shell dentro del contenedor." }
      ],
      example: { command: "qm list && qm snapshot 105 antes-actualizar --description \"Antes de actualizar la aplicación\" && qm listsnapshot 105", explanation: "Antes de actualizar una máquina, toma una instantánea para poder volver atrás con «qm rollback 105 antes-actualizar»." },
      tags: ["proxmox", "maquina virtual", "lxc", "snapshot", "instantanea"]
    },
    {
      id: "win-add-localgroupmember", name: "Add-LocalGroupMember", os: "windows", shell: "powershell", category: "users", risk: "caution",
      description: "Añade o quita usuarios y grupos del dominio en un grupo local del equipo.",
      syntax: "Add-LocalGroupMember -Group <grupo> -Member <cuenta> | Remove-LocalGroupMember -Group <grupo> -Member <cuenta>",
      flags: [
        { flag: "-Group", description: "Grupo local: Administradores, Usuarios de escritorio remoto…" },
        { flag: "-Member", description: "Cuenta local o del dominio (DOMINIO\\usuario)." },
        { flag: "Remove-LocalGroupMember", description: "Quita el miembro del grupo." }
      ],
      example: { command: "Add-LocalGroupMember -Group \"Usuarios de escritorio remoto\" -Member \"CORP\\jlopez\"; Get-LocalGroupMember -Group \"Usuarios de escritorio remoto\"", explanation: "Da acceso por Escritorio remoto a un usuario del dominio sin hacerlo administrador y comprueba el resultado." },
      tags: ["grupo local", "administradores", "escritorio remoto", "rdp", "miembro"]
    },
    {
      id: "win-get-localuser", name: "Get-LocalUser / Set-LocalUser", os: "windows", shell: "powershell", category: "users", risk: "caution",
      description: "Lista las cuentas locales del equipo y cambia su contraseña, caducidad o estado.",
      syntax: "Get-LocalUser [-Name <usuario>] | Set-LocalUser -Name <usuario> [-Password <segura>] [-PasswordNeverExpires <bool>] | Disable-LocalUser -Name <usuario>",
      flags: [
        { flag: "Get-LocalUser", description: "Cuentas locales, si están activas y su último inicio de sesión." },
        { flag: "-Password", description: "Nueva contraseña (SecureString)." },
        { flag: "-PasswordNeverExpires", description: "Activa o quita la caducidad." },
        { flag: "Disable-LocalUser", description: "Deshabilita la cuenta sin borrarla." }
      ],
      example: { command: "Get-LocalUser | Where-Object Enabled | Select-Object Name, LastLogon, PasswordLastSet, PasswordExpires", explanation: "Auditoría rápida de un servidor: qué cuentas locales están activas, cuándo se usaron por última vez y cuáles tienen la contraseña sin caducidad." },
      tags: ["cuentas locales", "usuario local", "deshabilitar", "auditoria", "contraseña"]
    },
    {
      id: "win-net-accounts", name: "net accounts", os: "windows", shell: "cmd", category: "users", risk: "caution",
      description: "Muestra y cambia la directiva local de contraseñas y de bloqueo de cuentas.",
      syntax: "net accounts [/minpwlen:N] [/maxpwage:días] [/lockoutthreshold:N] [/domain]",
      flags: [
        { flag: "(sin opciones)", description: "Directiva vigente." },
        { flag: "/minpwlen:12", description: "Longitud mínima de la contraseña." },
        { flag: "/lockoutthreshold:5", description: "Intentos fallidos antes de bloquear." },
        { flag: "/domain", description: "Consulta la directiva del dominio." }
      ],
      example: { command: "net accounts && net accounts /minpwlen:12 /maxpwage:90 /lockoutthreshold:5", explanation: "Endurece un equipo que no está en el dominio: contraseñas de 12 caracteres, caducidad a 90 días y bloqueo tras 5 fallos. En el dominio manda la GPO." },
      tags: ["directiva", "contraseñas", "bloqueo", "politica", "longitud minima"]
    },
    {
      id: "win-test-path", name: "Test-Path", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "Comprueba si existe un archivo, una carpeta o una clave del Registro; devuelve True o False.",
      syntax: "Test-Path <ruta> [-PathType Leaf|Container] [-NewerThan <fecha>]",
      flags: [
        { flag: "-PathType Leaf", description: "Verdadero solo si es un archivo." },
        { flag: "-PathType Container", description: "Verdadero solo si es una carpeta." },
        { flag: "-NewerThan", description: "Verdadero si se modificó después de esa fecha." }
      ],
      example: { command: "if (-not (Test-Path \"D:\\Backups\\$(Get-Date -Format yyyyMMdd)\")) { New-Item -ItemType Directory -Path \"D:\\Backups\\$(Get-Date -Format yyyyMMdd)\" | Out-Null }", explanation: "En un script de copias, crea la carpeta del día solo si todavía no existe, para que no falle al repetirse." },
      tags: ["existe", "comprobar", "ruta", "script", "condicion"]
    },
    {
      id: "win-out-file", name: "Out-File / Set-Content / Add-Content", os: "windows", shell: "powershell", category: "filesystem", risk: "caution",
      description: "Guarda la salida de un comando en un archivo, lo sobrescribe o le añade líneas.",
      syntax: "<comando> | Out-File <ruta> [-Append] [-Encoding utf8] | Set-Content <ruta> <texto> | Add-Content <ruta> <texto>",
      flags: [
        { flag: "Out-File", description: "Guarda la salida tal como se vería en pantalla." },
        { flag: "Set-Content", description: "Escribe el texto y sustituye el contenido." },
        { flag: "Add-Content", description: "Añade al final (útil para registros)." },
        { flag: "-Encoding utf8", description: "Codificación del archivo." }
      ],
      example: { command: "Add-Content -Path C:\\Logs\\mantenimiento.log -Value \"$(Get-Date -Format s) Reinicio del servicio Spooler en srv01\"", explanation: "Deja una línea con fecha y hora en un registro propio cada vez que el script hace algo." },
      tags: ["guardar", "escribir archivo", "log", "redireccion", "append"]
    },
    {
      id: "win-expand-archive", name: "Expand-Archive", os: "windows", shell: "powershell", category: "filesystem", risk: "caution",
      description: "Extrae un archivo .zip en una carpeta.",
      syntax: "Expand-Archive -Path <archivo.zip> -DestinationPath <carpeta> [-Force]",
      flags: [
        { flag: "-Path", description: "Archivo .zip de origen." },
        { flag: "-DestinationPath", description: "Carpeta de destino (se crea si no existe)." },
        { flag: "-Force", description: "Sobrescribe los archivos que ya existan." }
      ],
      example: { command: "Expand-Archive -Path C:\\Temp\\despliegue-v2.4.zip -DestinationPath C:\\inetpub\\wwwroot\\intranet -Force", explanation: "Despliega una versión nueva de la intranet descomprimiendo el paquete sobre la carpeta de la web." },
      tags: ["zip", "descomprimir", "extraer", "desplegar"]
    },
    {
      id: "win-findstr", name: "findstr", os: "windows", shell: "cmd", category: "filesystem", risk: "safe",
      description: "Busca texto en archivos o en la salida de otro comando: el grep de cmd.",
      syntax: "findstr [/i] [/s] [/n] [/r] [/c:\"frase\"] cadena [archivos]",
      flags: [
        { flag: "/i", description: "No distingue mayúsculas." },
        { flag: "/s", description: "Busca también en las subcarpetas." },
        { flag: "/n", description: "Muestra el número de línea." },
        { flag: "/c:\"frase\"", description: "Busca la frase exacta, con espacios." }
      ],
      example: { command: "findstr /s /i /n /c:\"connection string\" C:\\inetpub\\wwwroot\\*.config", explanation: "Localiza en qué archivos de configuración de la web aparece la cadena de conexión a la base de datos." },
      tags: ["buscar texto", "grep", "filtrar", "cadena"]
    },
    {
      id: "win-where", name: "where / Get-Command", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "Localiza qué ejecutable, cmdlet o alias se usará al escribir un comando.",
      syntax: "where.exe <programa> | Get-Command <nombre> [-All] [-Module <módulo>]",
      flags: [
        { flag: "where.exe", description: "Rutas del ejecutable según el PATH." },
        { flag: "Get-Command -All", description: "Todas las coincidencias: alias, funciones y programas." },
        { flag: "-Module", description: "Lista los comandos de un módulo." },
        { flag: "-Noun / -Verb", description: "Busca cmdlets por nombre o verbo." }
      ],
      example: { command: "where.exe python; Get-Command curl -All | Select-Object CommandType, Name, Source", explanation: "Averigua qué Python se ejecuta cuando hay varios y descubre que en PowerShell 5.1 «curl» es un alias de Invoke-WebRequest." },
      tags: ["ruta", "path", "ejecutable", "alias", "localizar"]
    },
    {
      id: "win-folder-size", name: "Measure-Object (tamaño de carpetas)", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "Calcula cuánto ocupa cada carpeta para encontrar qué está llenando un disco.",
      syntax: "Get-ChildItem <ruta> -Recurse -File | Measure-Object -Property Length -Sum",
      flags: [
        { flag: "-Recurse -File", description: "Todos los archivos de las subcarpetas." },
        { flag: "-Property Length -Sum", description: "Suma los tamaños en bytes." },
        { flag: "-ErrorAction SilentlyContinue", description: "Ignora las carpetas sin permiso." }
      ],
      example: { command: "Get-ChildItem D:\\Datos -Directory | ForEach-Object { [pscustomobject]@{ Carpeta = $_.Name; GB = [math]::Round((Get-ChildItem $_.FullName -Recurse -File -ErrorAction SilentlyContinue | Measure-Object Length -Sum).Sum / 1GB, 2) } } | Sort-Object GB -Descending", explanation: "El disco D: se está llenando: lista las carpetas de primer nivel ordenadas por tamaño para ver cuál es la culpable." },
      tags: ["tamaño", "espacio", "carpeta", "disco lleno", "du"]
    },
    {
      id: "win-where-object", name: "Where-Object / Select-Object / Sort-Object", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "Filtra, elige columnas y ordena los objetos que devuelve cualquier cmdlet.",
      syntax: "<cmdlet> | Where-Object { condición } | Sort-Object <propiedad> [-Descending] | Select-Object <propiedades> [-First N]",
      flags: [
        { flag: "Where-Object", description: "Deja pasar solo lo que cumple la condición." },
        { flag: "Sort-Object -Descending", description: "Ordena de mayor a menor." },
        { flag: "Select-Object -First 10", description: "Se queda con los 10 primeros." },
        { flag: "-ExpandProperty", description: "Devuelve solo el valor, sin cabecera." }
      ],
      example: { command: "Get-Process | Where-Object { $_.WorkingSet64 -gt 500MB } | Sort-Object WorkingSet64 -Descending | Select-Object -First 10 Name, Id, @{ n = \"RAM_MB\"; e = { [int]($_.WorkingSet64 / 1MB) } }", explanation: "Los 10 procesos que usan más de 500 MB de memoria, con la RAM en megas. El mismo patrón sirve con servicios, archivos o usuarios." },
      tags: ["filtrar", "ordenar", "columnas", "pipeline", "tuberia"]
    },
    {
      id: "win-get-help", name: "Get-Help / Get-Member", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "Muestra la ayuda y los ejemplos de un cmdlet, y las propiedades de los objetos que devuelve.",
      syntax: "Get-Help <cmdlet> [-Examples] [-Parameter <nombre>] [-Online] | <cmdlet> | Get-Member",
      flags: [
        { flag: "-Examples", description: "Solo los ejemplos de uso." },
        { flag: "-Parameter", description: "Explica un parámetro concreto." },
        { flag: "-Online", description: "Abre la documentación en el navegador." },
        { flag: "Get-Member", description: "Propiedades y métodos disponibles." }
      ],
      example: { command: "Get-Help Get-Service -Examples; Get-Service | Get-Member -MemberType Property", explanation: "Antes de filtrar la salida de un cmdlet que no conoces, mira sus ejemplos y qué propiedades puedes usar en Where-Object o Select-Object." },
      tags: ["ayuda", "ejemplos", "propiedades", "documentacion", "man"]
    },
    {
      id: "win-ping", name: "ping", os: "windows", shell: "cmd", category: "network", risk: "safe",
      description: "Comprueba si un equipo responde por ICMP y mide la latencia y la pérdida de paquetes.",
      syntax: "ping [-n N] [-t] [-l bytes] [-f] [-4] [-a] destino",
      flags: [
        { flag: "-n 10", description: "Envía 10 paquetes en lugar de 4." },
        { flag: "-t", description: "Continuo hasta pulsar Ctrl+C." },
        { flag: "-f -l 1472", description: "Sin fragmentar: sirve para probar la MTU." },
        { flag: "-a", description: "Resuelve el nombre de una dirección IP." }
      ],
      example: { command: "ping -n 4 srv01.corp.local && ping -f -l 1472 192.168.10.1", explanation: "Comprueba que un servidor responde y que una MTU de 1500 llega a la puerta de enlace sin fragmentar (útil en problemas con VPN)." },
      tags: ["icmp", "conectividad", "latencia", "mtu", "perdida de paquetes"]
    },
    {
      id: "win-nslookup", name: "nslookup", os: "windows", shell: "cmd", category: "network", risk: "safe",
      description: "Consulta registros DNS contra el servidor configurado o contra otro que indiques.",
      syntax: "nslookup [-type=A|MX|TXT|SRV|PTR] nombre [servidor]",
      flags: [
        { flag: "-type=MX", description: "Servidores de correo del dominio." },
        { flag: "-type=SRV", description: "Registros de servicio (por ejemplo, de Active Directory)." },
        { flag: "-type=TXT", description: "Registros de texto: SPF, verificaciones." },
        { flag: "nombre servidor", description: "Pregunta a un servidor DNS concreto." }
      ],
      example: { command: "nslookup -type=SRV _ldap._tcp.dc._msdcs.corp.local && nslookup -type=MX empresa.com 1.1.1.1", explanation: "Comprueba que el equipo encuentra los controladores de dominio por DNS y consulta el correo de un dominio en un DNS público." },
      tags: ["dns", "registros", "mx", "srv", "resolver"]
    },
    {
      id: "win-get-netadapter", name: "Get-NetAdapter / Restart-NetAdapter", os: "windows", shell: "powershell", category: "network", risk: "caution",
      description: "Lista las tarjetas de red con su estado y velocidad, y las reinicia o deshabilita.",
      syntax: "Get-NetAdapter [-Name <nombre>] [-Physical] | Restart-NetAdapter -Name <nombre> | Disable-NetAdapter -Name <nombre>",
      flags: [
        { flag: "-Physical", description: "Solo las tarjetas físicas." },
        { flag: "Restart-NetAdapter", description: "Deshabilita y vuelve a habilitar la tarjeta." },
        { flag: "Get-NetAdapterStatistics", description: "Bytes y paquetes descartados." }
      ],
      example: { command: "Get-NetAdapter -Physical | Select-Object Name, Status, LinkSpeed, MacAddress; Restart-NetAdapter -Name \"Ethernet0\"", explanation: "Comprueba que la tarjeta tiene enlace a la velocidad esperada y la reinicia. Si estás conectado por esa misma tarjeta, perderás la sesión unos segundos." },
      tags: ["tarjeta de red", "adaptador", "velocidad", "mac", "reiniciar red"]
    },
    {
      id: "win-get-netipconfiguration", name: "Get-NetIPConfiguration", os: "windows", shell: "powershell", category: "network", risk: "safe",
      description: "Resume la configuración IP de cada adaptador: dirección, puerta de enlace y DNS.",
      syntax: "Get-NetIPConfiguration [-InterfaceAlias <nombre>] [-Detailed] [-All]",
      flags: [
        { flag: "-Detailed", description: "Añade perfil de red, MTU y estado de DHCP." },
        { flag: "-InterfaceAlias", description: "Solo un adaptador." },
        { flag: "-All", description: "Incluye los adaptadores desconectados." }
      ],
      example: { command: "Get-NetIPConfiguration | Select-Object InterfaceAlias, @{ n = \"IP\"; e = { $_.IPv4Address.IPAddress } }, @{ n = \"Puerta\"; e = { $_.IPv4DefaultGateway.NextHop } }, @{ n = \"DNS\"; e = { $_.DNSServer.ServerAddresses -join \", \" } }", explanation: "El equivalente a «ipconfig /all» en forma de objetos: una tabla limpia que se puede exportar o comparar entre servidores." },
      tags: ["ip", "puerta de enlace", "dns", "configuracion de red", "ipconfig"]
    },
    {
      id: "win-getmac", name: "getmac / nbtstat", os: "windows", shell: "cmd", category: "network", risk: "safe",
      description: "Muestra las direcciones MAC del equipo o de uno remoto y sus nombres NetBIOS.",
      syntax: "getmac [/v] [/s equipo] [/fo csv] | nbtstat -A dirección_IP | nbtstat -n",
      flags: [
        { flag: "getmac /v", description: "Añade el nombre del adaptador." },
        { flag: "getmac /s", description: "Consulta un equipo remoto." },
        { flag: "nbtstat -A", description: "Nombres NetBIOS y MAC de una IP." },
        { flag: "nbtstat -n", description: "Nombres NetBIOS locales." }
      ],
      example: { command: "getmac /v /fo table && nbtstat -A 192.168.10.25", explanation: "Obtiene la MAC para una reserva DHCP y averigua qué equipo hay detrás de una IP que no reconoces." },
      tags: ["mac", "direccion fisica", "netbios", "reserva dhcp", "identificar equipo"]
    },
    {
      id: "win-curl", name: "curl.exe", os: "windows", shell: "cmd", category: "network", risk: "safe",
      description: "Cliente HTTP incluido en Windows 10 y 11: prueba webs, API y certificados igual que en Linux.",
      syntax: "curl.exe [-I] [-L] [-k] [-o archivo] [-H cabecera] [-w formato] URL",
      flags: [
        { flag: "-I", description: "Solo las cabeceras de la respuesta." },
        { flag: "-L", description: "Sigue las redirecciones." },
        { flag: "-o archivo", description: "Guarda la respuesta en un archivo." },
        { flag: "-w \"%{http_code}\"", description: "Imprime el código HTTP." }
      ],
      example: { command: "curl.exe -s -o NUL -w \"%{http_code} en %{time_total}s\\n\" https://empresa.com", explanation: "Comprueba que una web responde y cuánto tarda. Escribe «curl.exe», con la extensión: en PowerShell 5.1 «curl» a secas es otro comando." },
      tags: ["http", "api", "web", "codigo de estado", "descargar"]
    },
    {
      id: "win-test-wsman", name: "Test-WSMan", os: "windows", shell: "powershell", category: "network", risk: "safe",
      description: "Comprueba si la administración remota (WinRM) responde en un equipo.",
      syntax: "Test-WSMan [-ComputerName <equipo>] [-UseSSL] [-Authentication <tipo>]",
      flags: [
        { flag: "-ComputerName", description: "Equipo que se comprueba." },
        { flag: "-UseSSL", description: "Prueba el puerto HTTPS (5986)." },
        { flag: "-Authentication Default", description: "Comprueba también que te autentica." }
      ],
      example: { command: "Test-WSMan -ComputerName srv02 -Authentication Default", explanation: "Antes de lanzar Invoke-Command contra un servidor, comprueba que WinRM está activo y que tu cuenta puede autenticarse." },
      tags: ["winrm", "remoto", "psremoting", "5985", "administracion remota"]
    },
    {
      id: "win-tasklist", name: "tasklist", os: "windows", shell: "cmd", category: "processes", risk: "safe",
      description: "Lista los procesos con su PID, memoria y, si se pide, los servicios que alojan.",
      syntax: "tasklist [/svc] [/v] [/fi \"filtro\"] [/s equipo] [/fo csv]",
      flags: [
        { flag: "/svc", description: "Servicios que se ejecutan en cada proceso." },
        { flag: "/fi \"PID eq 1234\"", description: "Filtra por PID, nombre, memoria…" },
        { flag: "/v", description: "Añade usuario, tiempo de CPU y título." },
        { flag: "/s equipo", description: "Consulta un equipo remoto." }
      ],
      example: { command: "netstat -ano | findstr :443 && tasklist /svc /fi \"PID eq 4120\"", explanation: "Averigua qué programa ocupa un puerto: netstat da el PID y tasklist dice qué proceso y qué servicio hay detrás." },
      tags: ["procesos", "pid", "servicios", "svchost", "puerto ocupado"]
    },
    {
      id: "win-restart-service", name: "Restart-Service / Set-Service", os: "windows", shell: "powershell", category: "processes", risk: "caution",
      description: "Reinicia, detiene o inicia servicios y cambia su tipo de inicio.",
      syntax: "Restart-Service -Name <servicio> [-Force] | Stop-Service | Start-Service | Set-Service -Name <servicio> -StartupType Automatic|Manual|Disabled",
      flags: [
        { flag: "-Force", description: "Reinicia también los servicios dependientes." },
        { flag: "-StartupType", description: "Automático, manual o deshabilitado." },
        { flag: "-PassThru", description: "Devuelve el servicio para ver su estado." }
      ],
      example: { command: "Restart-Service -Name Spooler -Force -PassThru; Set-Service -Name Spooler -StartupType Automatic", explanation: "La cola de impresión se ha quedado bloqueada: reinicia el servicio y se asegura de que arranque solo con el sistema." },
      tags: ["reiniciar servicio", "detener", "iniciar", "tipo de inicio", "automatico"]
    },
    {
      id: "win-w32tm", name: "w32tm", os: "windows", shell: "cmd", category: "processes", risk: "caution",
      description: "Consulta y fuerza la sincronización de la hora de Windows.",
      syntax: "w32tm /query /status | /query /source | /resync [/rediscover] | /stripchart /computer:servidor",
      flags: [
        { flag: "/query /status", description: "Origen de la hora, desfase y última sincronización." },
        { flag: "/query /source", description: "De dónde toma la hora el equipo." },
        { flag: "/resync", description: "Sincroniza ahora." },
        { flag: "/stripchart", description: "Mide el desfase contra otro servidor." }
      ],
      example: { command: "w32tm /query /source && w32tm /resync /rediscover && w32tm /stripchart /computer:dc01.corp.local /samples:3 /dataonly", explanation: "Un equipo no puede iniciar sesión en el dominio: con más de 5 minutos de desfase falla Kerberos. Comprueba el origen de la hora y sincroniza." },
      tags: ["hora", "ntp", "sincronizar", "kerberos", "reloj"]
    },
    {
      id: "win-get-uptime", name: "Get-Uptime", os: "windows", shell: "powershell", category: "processes", risk: "safe",
      description: "Indica cuánto tiempo lleva encendido el equipo y cuándo arrancó por última vez.",
      syntax: "Get-Uptime [-Since] | (Get-CimInstance Win32_OperatingSystem).LastBootUpTime",
      requires: "Get-Uptime necesita PowerShell 7; la alternativa con Get-CimInstance funciona en 5.1",
      flags: [
        { flag: "(sin opciones)", description: "Tiempo transcurrido desde el arranque." },
        { flag: "-Since", description: "Fecha y hora del último arranque." },
        { flag: "Win32_OperatingSystem", description: "Alternativa para Windows PowerShell 5.1 y equipos remotos." }
      ],
      example: { command: "Get-CimInstance Win32_OperatingSystem -ComputerName srv01, srv02 | Select-Object PSComputerName, LastBootUpTime, @{ n = \"Dias\"; e = { ((Get-Date) - $_.LastBootUpTime).Days } }", explanation: "Comprueba qué servidores llevan demasiado tiempo sin reiniciarse y tienen parches pendientes de aplicar." },
      tags: ["tiempo encendido", "ultimo arranque", "reinicio", "uptime"]
    },
    {
      id: "win-pnputil", name: "driverquery / pnputil", os: "windows", shell: "cmd", category: "processes", risk: "caution",
      description: "Lista los controladores instalados y añade o quita paquetes de controladores.",
      syntax: "driverquery [/v] [/fo csv] | pnputil /enum-drivers | pnputil /add-driver <archivo.inf> /install | pnputil /delete-driver <oemN.inf>",
      flags: [
        { flag: "driverquery /v", description: "Controladores con su estado y ruta." },
        { flag: "/enum-drivers", description: "Paquetes de terceros en el almacén." },
        { flag: "/add-driver ... /install", description: "Añade e instala un controlador." },
        { flag: "/delete-driver", description: "Quita un paquete del almacén." }
      ],
      example: { command: "pnputil /enum-drivers | findstr /i \"Proveedor Provider Versi\" && pnputil /add-driver C:\\Drivers\\impresora\\*.inf /subdirs /install", explanation: "Instala el controlador de una impresora desde la consola, sin asistente, y revisa qué controladores de terceros hay." },
      tags: ["controladores", "drivers", "impresora", "inf", "dispositivo"]
    },
    {
      id: "win-env", name: "$env: / setx", os: "windows", shell: "powershell", category: "processes", risk: "caution",
      description: "Lee y define variables de entorno para la sesión o de forma permanente.",
      syntax: "$env:VARIABLE | $env:VARIABLE = \"valor\" | Get-ChildItem Env: | setx VARIABLE \"valor\" [/M]",
      flags: [
        { flag: "$env:PATH", description: "Lee una variable." },
        { flag: "$env:VAR = \"x\"", description: "La define solo para la sesión actual." },
        { flag: "setx", description: "La guarda para el usuario (sesiones nuevas)." },
        { flag: "setx /M", description: "La guarda para todo el equipo (requiere administrador)." }
      ],
      example: { command: "$env:PATH -split \";\"; setx HTTPS_PROXY \"http://proxy.corp.local:3128\" /M", explanation: "Revisa el PATH línea a línea y configura el proxy para todo el equipo. No uses setx con PATH: recorta el valor a 1024 caracteres." },
      tags: ["variables de entorno", "path", "proxy", "setx", "entorno"]
    },
    {
      id: "win-get-netfirewallrule", name: "Get-NetFirewallRule / Get-NetFirewallProfile", os: "windows", shell: "powershell", category: "security", risk: "safe",
      description: "Consulta las reglas del cortafuegos de Windows y si cada perfil está activado.",
      syntax: "Get-NetFirewallProfile | Get-NetFirewallRule [-Enabled True] [-Direction Inbound] [-Action Allow] | Get-NetFirewallPortFilter",
      flags: [
        { flag: "Get-NetFirewallProfile", description: "Estado de los perfiles Dominio, Privado y Público." },
        { flag: "-Direction Inbound", description: "Solo las reglas de entrada." },
        { flag: "-Enabled True", description: "Solo las reglas activas." },
        { flag: "Get-NetFirewallPortFilter", description: "Puerto y protocolo de cada regla." }
      ],
      example: { command: "Get-NetFirewallProfile | Select-Object Name, Enabled; Get-NetFirewallRule -Enabled True -Direction Inbound -Action Allow | Get-NetFirewallPortFilter | Where-Object LocalPort -eq 3389", explanation: "Comprueba que el cortafuegos está activado en los tres perfiles y busca qué regla permite la entrada por Escritorio remoto." },
      tags: ["cortafuegos", "firewall", "reglas", "perfil", "puerto abierto"]
    },
    {
      id: "win-start-mpscan", name: "Start-MpScan / Update-MpSignature", os: "windows", shell: "powershell", category: "security", risk: "caution",
      description: "Actualiza las firmas de Microsoft Defender y lanza un análisis.",
      syntax: "Update-MpSignature | Start-MpScan -ScanType QuickScan|FullScan|CustomScan [-ScanPath <ruta>] | Get-MpThreatDetection",
      flags: [
        { flag: "Update-MpSignature", description: "Descarga las firmas más recientes." },
        { flag: "-ScanType QuickScan", description: "Análisis rápido de las zonas habituales." },
        { flag: "-ScanType CustomScan -ScanPath", description: "Analiza solo una carpeta." },
        { flag: "Get-MpThreatDetection", description: "Amenazas detectadas y qué se hizo con ellas." }
      ],
      example: { command: "Update-MpSignature; Start-MpScan -ScanType CustomScan -ScanPath \"D:\\Datos\\Compartido\"; Get-MpThreatDetection | Select-Object -First 5 InitialDetectionTime, Resources", explanation: "Un usuario ha abierto un adjunto sospechoso: actualiza las firmas, analiza la carpeta compartida y revisa si se detectó algo." },
      tags: ["antivirus", "defender", "analisis", "malware", "firmas"]
    },
    {
      id: "win-failed-logons", name: "Get-WinEvent (inicios de sesión fallidos)", os: "windows", shell: "powershell", category: "security", risk: "safe",
      description: "Extrae del registro de seguridad los inicios de sesión fallidos (evento 4625) con usuario y origen.",
      syntax: "Get-WinEvent -FilterHashtable @{ LogName = \"Security\"; Id = 4625; StartTime = <fecha> } [-MaxEvents N]",
      flags: [
        { flag: "Id = 4625", description: "Inicio de sesión fallido." },
        { flag: "Id = 4740", description: "Cuenta bloqueada (consúltalo en el controlador de dominio)." },
        { flag: "StartTime", description: "Solo los eventos desde esa fecha." },
        { flag: "Properties[5] / [19]", description: "Usuario e IP de origen del evento 4625." }
      ],
      example: { command: "Get-WinEvent -FilterHashtable @{ LogName = \"Security\"; Id = 4625; StartTime = (Get-Date).AddHours(-24) } | Group-Object { $_.Properties[5].Value + \" desde \" + $_.Properties[19].Value } | Sort-Object Count -Descending | Select-Object -First 10 Count, Name", explanation: "Las 10 combinaciones de usuario e IP con más fallos en las últimas 24 horas: distingue un usuario despistado de un ataque de fuerza bruta." },
      tags: ["4625", "fuerza bruta", "inicio de sesion", "auditoria", "bloqueo"]
    },
    {
      id: "win-unblock-file", name: "Unblock-File", os: "windows", shell: "powershell", category: "security", risk: "caution",
      description: "Quita la marca de «descargado de Internet» que impide ejecutar scripts y programas bajados.",
      syntax: "Unblock-File -Path <archivo> | Get-ChildItem <carpeta> -Recurse | Unblock-File | Get-Item <archivo> -Stream Zone.Identifier",
      flags: [
        { flag: "-Path", description: "Archivo que se desbloquea." },
        { flag: "-Stream Zone.Identifier", description: "Comprueba si el archivo está marcado." },
        { flag: "-WhatIf", description: "Muestra qué haría sin hacerlo." }
      ],
      example: { command: "Get-AuthenticodeSignature C:\\Scripts\\inventario.ps1 | Select-Object Status, SignerCertificate; Unblock-File -Path C:\\Scripts\\inventario.ps1", explanation: "Un script descargado no se ejecuta con la directiva RemoteSigned: revisa su firma y, si confías en el origen, lo desbloquea." },
      tags: ["desbloquear", "zone identifier", "script bloqueado", "remotesigned", "descargado"]
    },
    {
      id: "win-get-scheduledtask", name: "Get-ScheduledTask / Start-ScheduledTask", os: "windows", shell: "powershell", category: "automation", risk: "caution",
      description: "Lista las tareas programadas, muestra su último resultado y las ejecuta a mano.",
      syntax: "Get-ScheduledTask [-TaskName <nombre>] [-TaskPath <ruta>] | Get-ScheduledTaskInfo | Start-ScheduledTask -TaskName <nombre>",
      flags: [
        { flag: "Get-ScheduledTaskInfo", description: "Última ejecución, resultado y próxima ejecución." },
        { flag: "-TaskPath \"\\\"", description: "Solo las tareas de la carpeta raíz." },
        { flag: "Start-ScheduledTask", description: "Ejecuta la tarea ahora." },
        { flag: "Disable-ScheduledTask", description: "La deja deshabilitada." }
      ],
      example: { command: "Get-ScheduledTask -TaskPath \"\\\" | Get-ScheduledTaskInfo | Where-Object LastTaskResult -ne 0 | Select-Object TaskName, LastRunTime, LastTaskResult", explanation: "Revisa qué tareas programadas terminaron con error la última vez (un resultado distinto de 0), como una copia nocturna que no se hizo." },
      tags: ["tareas programadas", "resultado", "ultima ejecucion", "copia nocturna"]
    },
    {
      id: "win-import-csv", name: "Import-Csv / ForEach-Object", os: "windows", shell: "powershell", category: "automation", risk: "caution",
      description: "Lee un CSV como objetos y repite una acción por cada fila: la base de cualquier alta masiva.",
      syntax: "Import-Csv <archivo.csv> [-Delimiter \";\"] [-Encoding UTF8] | ForEach-Object { acción con $_.Columna }",
      flags: [
        { flag: "-Delimiter \";\"", description: "Separador (Excel en español usa punto y coma)." },
        { flag: "-Encoding UTF8", description: "Evita que se rompan tildes y eñes." },
        { flag: "$_.Columna", description: "Valor de esa columna en la fila actual." },
        { flag: "-WhatIf", description: "Añádelo a la acción para simular primero." }
      ],
      example: { command: "Import-Csv C:\\Temp\\altas.csv -Delimiter \";\" -Encoding UTF8 | ForEach-Object { New-ADUser -Name \"$($_.Nombre) $($_.Apellido)\" -SamAccountName $_.Usuario -Department $_.Departamento -Path \"OU=Usuarios,DC=corp,DC=local\" -WhatIf }", explanation: "Alta de varios empleados desde la hoja de Recursos Humanos. Con -WhatIf solo muestra lo que crearía; quítalo cuando el resultado sea el esperado." },
      tags: ["csv", "masivo", "bucle", "alta de usuarios", "excel"]
    },
    {
      id: "win-convertfrom-json", name: "ConvertFrom-Json / ConvertTo-Json", os: "windows", shell: "powershell", category: "automation", risk: "safe",
      description: "Convierte JSON en objetos de PowerShell y al revés, para leer configuraciones y respuestas de API.",
      syntax: "Get-Content <archivo.json> -Raw | ConvertFrom-Json | <objeto> | ConvertTo-Json [-Depth N] [-Compress]",
      flags: [
        { flag: "-Raw", description: "Lee el archivo entero como un solo texto." },
        { flag: "-Depth 10", description: "Niveles que se convierten (por defecto solo 2)." },
        { flag: "-Compress", description: "Sin espacios ni saltos de línea." }
      ],
      example: { command: "$cfg = Get-Content C:\\App\\appsettings.json -Raw | ConvertFrom-Json; $cfg.Logging.LogLevel.Default = \"Warning\"; $cfg | ConvertTo-Json -Depth 10 | Set-Content C:\\App\\appsettings.json", explanation: "Cambia un valor de la configuración de una aplicación sin editar el archivo a mano. Sin -Depth suficiente, los niveles profundos se pierden." },
      tags: ["json", "api", "configuracion", "convertir", "objetos"]
    },
    {
      id: "win-try-catch", name: "try / catch / -ErrorAction", os: "windows", shell: "powershell", category: "automation", risk: "safe",
      description: "Controla los errores de un script para que no siga adelante a ciegas ni falle en silencio.",
      syntax: "try { <comando> -ErrorAction Stop } catch { <qué hacer>; $_.Exception.Message } finally { <limpieza> }",
      flags: [
        { flag: "-ErrorAction Stop", description: "Convierte el error en uno que catch puede capturar." },
        { flag: "$_.Exception.Message", description: "Texto del error dentro de catch." },
        { flag: "finally", description: "Se ejecuta siempre, haya error o no." },
        { flag: "$ErrorActionPreference", description: "Comportamiento por defecto de todo el script." }
      ],
      example: { command: "try { Copy-Item D:\\Datos\\contabilidad.bak \\\\srv02\\backup\\ -ErrorAction Stop; Write-Output \"Copia correcta\" } catch { Add-Content C:\\Logs\\backup.log \"$(Get-Date -Format s) ERROR: $($_.Exception.Message)\"; exit 1 }", explanation: "Si la copia falla, lo anota en el registro y termina con código 1 para que la tarea programada aparezca como fallida." },
      tags: ["errores", "excepciones", "script", "control de errores", "exit"]
    },
    {
      id: "win-measure-command", name: "Measure-Command", os: "windows", shell: "powershell", category: "automation", risk: "safe",
      description: "Mide cuánto tarda en ejecutarse un comando o un bloque de script.",
      syntax: "Measure-Command { <comandos> } | Select-Object TotalSeconds",
      flags: [
        { flag: "{ ... }", description: "Bloque que se cronometra (su salida no se muestra)." },
        { flag: "TotalSeconds", description: "Duración en segundos." },
        { flag: "TotalMilliseconds", description: "Duración en milisegundos." }
      ],
      example: { command: "(Measure-Command { robocopy D:\\Datos \\\\srv02\\backup\\Datos /MIR /R:1 /W:1 /NFL /NDL }).TotalMinutes", explanation: "Mide cuánto tarda la copia nocturna para saber si cabe en la ventana de mantenimiento." },
      tags: ["tiempo", "duracion", "cronometrar", "rendimiento"]
    },
    {
      id: "win-get-psdrive", name: "Get-PSDrive", os: "windows", shell: "powershell", category: "storage", risk: "safe",
      description: "Lista las unidades de disco y de red con su espacio usado y libre.",
      syntax: "Get-PSDrive [-PSProvider FileSystem] [-Name <letra>]",
      flags: [
        { flag: "-PSProvider FileSystem", description: "Solo discos y unidades de red." },
        { flag: "-Name C", description: "Una unidad concreta." },
        { flag: "Used / Free", description: "Bytes usados y libres." }
      ],
      example: { command: "Get-PSDrive -PSProvider FileSystem | Select-Object Name, @{ n = \"UsadoGB\"; e = { [math]::Round($_.Used / 1GB, 1) } }, @{ n = \"LibreGB\"; e = { [math]::Round($_.Free / 1GB, 1) } }, Root", explanation: "Vistazo rápido al espacio libre de todas las unidades, incluidas las de red asignadas." },
      tags: ["espacio libre", "unidades", "disco", "unidad de red"]
    },
    {
      id: "win-repair-volume", name: "Repair-Volume", os: "windows", shell: "powershell", category: "storage", risk: "caution",
      description: "Comprueba y repara el sistema de archivos de un volumen: el chkdsk de PowerShell.",
      syntax: "Repair-Volume -DriveLetter <letra> [-Scan] [-SpotFix] [-OfflineScanAndFix]",
      flags: [
        { flag: "-Scan", description: "Analiza en caliente, sin desmontar ni reparar." },
        { flag: "-SpotFix", description: "Repara solo lo detectado, con un corte breve." },
        { flag: "-OfflineScanAndFix", description: "Desmonta el volumen y lo repara por completo." }
      ],
      example: { command: "Repair-Volume -DriveLetter D -Scan", explanation: "Comprueba el volumen de datos sin interrumpir a los usuarios. Si devuelve errores, programa un -SpotFix fuera de horario." },
      tags: ["chkdsk", "reparar disco", "sistema de archivos", "ntfs", "errores"]
    },
    {
      id: "win-wbadmin", name: "wbadmin", os: "windows", shell: "cmd", category: "storage", risk: "caution",
      description: "Lanza y consulta copias de seguridad con Copias de seguridad de Windows Server.",
      syntax: "wbadmin start backup -backupTarget:<destino> -include:<volúmenes> [-allCritical] [-quiet] | wbadmin get versions",
      requires: "Característica Copias de seguridad de Windows Server: Install-WindowsFeature Windows-Server-Backup",
      flags: [
        { flag: "-backupTarget", description: "Disco o carpeta de red de destino." },
        { flag: "-include:C:,D:", description: "Volúmenes que se copian." },
        { flag: "-allCritical", description: "Añade lo necesario para restaurar el sistema." },
        { flag: "get versions", description: "Copias disponibles para restaurar." }
      ],
      example: { command: "wbadmin start backup -backupTarget:\\\\srv02\\backup\\srv01 -include:C: -allCritical -quiet && wbadmin get versions", explanation: "Copia completa del sistema a una carpeta de red antes de una actualización importante, y comprobación de que ha quedado registrada." },
      tags: ["copia de seguridad", "backup", "restaurar", "imagen del sistema"]
    },
    {
      id: "win-install-module", name: "Install-Module / Update-Module", os: "windows", shell: "powershell", category: "packages", risk: "caution",
      description: "Instala y actualiza módulos de PowerShell desde la Galería de PowerShell.",
      syntax: "Find-Module <nombre> | Install-Module <nombre> [-Scope CurrentUser|AllUsers] [-RequiredVersion <v>] | Update-Module <nombre> | Get-InstalledModule",
      flags: [
        { flag: "-Scope CurrentUser", description: "Solo para tu usuario, sin ser administrador." },
        { flag: "-RequiredVersion", description: "Instala una versión concreta." },
        { flag: "Get-InstalledModule", description: "Módulos instalados y su versión." },
        { flag: "Update-Module", description: "Actualiza a la última versión." }
      ],
      example: { command: "Install-Module ExchangeOnlineManagement -Scope CurrentUser; Get-InstalledModule | Select-Object Name, Version", explanation: "Instala el módulo de Exchange Online para tu usuario y revisa qué módulos hay y en qué versión." },
      tags: ["modulos", "galeria", "psgallery", "instalar", "actualizar"]
    },
    {
      id: "win-choco", name: "choco", os: "windows", shell: "powershell", category: "packages", risk: "caution",
      description: "Chocolatey: gestor de paquetes de terceros muy usado para instalar y actualizar software en lote.",
      syntax: "choco install <paquetes> -y | choco upgrade all -y | choco list | choco outdated",
      requires: "Chocolatey instalado (https://chocolatey.org/install)",
      flags: [
        { flag: "install -y", description: "Instala sin pedir confirmación." },
        { flag: "upgrade all -y", description: "Actualiza todo lo instalado con Chocolatey." },
        { flag: "outdated", description: "Paquetes con una versión nueva disponible." },
        { flag: "list", description: "Paquetes instalados." }
      ],
      example: { command: "choco outdated; choco install 7zip notepadplusplus git -y", explanation: "Deja listo un equipo nuevo con las herramientas habituales en una sola orden y revisa qué hay pendiente de actualizar." },
      tags: ["chocolatey", "instalar software", "paquetes", "actualizar", "lote"]
    },
    {
      id: "win-get-adgroupmember", name: "Get-ADGroupMember", os: "windows", shell: "powershell", category: "ad", risk: "safe",
      description: "Lista los miembros de un grupo de Active Directory, incluidos los de los grupos anidados.",
      syntax: "Get-ADGroupMember -Identity <grupo> [-Recursive]",
      requires: "Módulo ActiveDirectory (RSAT)",
      flags: [
        { flag: "-Identity", description: "Nombre, DN o SID del grupo." },
        { flag: "-Recursive", description: "Resuelve los grupos anidados hasta llegar a los usuarios." }
      ],
      example: { command: "Get-ADGroupMember -Identity \"Domain Admins\" -Recursive | Get-ADUser -Properties LastLogonDate | Select-Object Name, SamAccountName, Enabled, LastLogonDate", explanation: "Auditoría de los administradores del dominio: quiénes son de verdad, contando los grupos anidados, y cuándo entraron por última vez." },
      tags: ["miembros", "grupo", "anidados", "auditoria", "domain admins"]
    },
    {
      id: "win-search-adaccount", name: "Search-ADAccount", os: "windows", shell: "powershell", category: "ad", risk: "safe",
      description: "Busca cuentas bloqueadas, inactivas, caducadas o con la contraseña sin caducidad.",
      syntax: "Search-ADAccount -LockedOut | -AccountInactive -TimeSpan <días> | -PasswordNeverExpires | -AccountExpired [-UsersOnly]",
      requires: "Módulo ActiveDirectory (RSAT)",
      flags: [
        { flag: "-LockedOut", description: "Cuentas bloqueadas ahora mismo." },
        { flag: "-AccountInactive -TimeSpan 90", description: "Sin iniciar sesión en 90 días." },
        { flag: "-PasswordNeverExpires", description: "Contraseña sin caducidad." },
        { flag: "-UsersOnly", description: "Excluye las cuentas de equipo." }
      ],
      example: { command: "Search-ADAccount -LockedOut -UsersOnly | Select-Object Name, SamAccountName, LastLogonDate; Search-ADAccount -AccountInactive -TimeSpan 90.00:00:00 -UsersOnly | Where-Object Enabled | Measure-Object", explanation: "Lista quién está bloqueado ahora mismo y cuenta las cuentas activas que llevan 90 días sin usarse, candidatas a deshabilitar." },
      tags: ["cuentas bloqueadas", "inactivas", "caducadas", "limpieza", "auditoria"]
    },
    {
      id: "win-nltest", name: "nltest", os: "windows", shell: "cmd", category: "ad", risk: "safe",
      description: "Diagnostica la relación del equipo con el dominio: controlador en uso, canal seguro y confianzas.",
      syntax: "nltest /dsgetdc:<dominio> | /sc_verify:<dominio> | /dclist:<dominio> | /domain_trusts",
      flags: [
        { flag: "/dsgetdc", description: "Controlador de dominio que encuentra el equipo y su sitio." },
        { flag: "/sc_verify", description: "Comprueba el canal seguro con el dominio." },
        { flag: "/dclist", description: "Lista los controladores del dominio." },
        { flag: "/domain_trusts", description: "Relaciones de confianza." }
      ],
      example: { command: "nltest /dsgetdc:corp.local && nltest /sc_verify:corp.local", explanation: "Un equipo tarda en iniciar sesión o no aplica las directivas: comprueba qué controlador usa, si es el de su sitio y si el canal seguro está bien." },
      tags: ["controlador de dominio", "canal seguro", "confianza", "sitio", "diagnostico"]
    },
    {
      id: "win-get-adprincipalgroupmembership", name: "Get-ADPrincipalGroupMembership", os: "windows", shell: "powershell", category: "ad", risk: "safe",
      description: "Muestra a qué grupos pertenece un usuario o equipo de Active Directory.",
      syntax: "Get-ADPrincipalGroupMembership -Identity <usuario> | Select-Object Name, GroupScope",
      requires: "Módulo ActiveDirectory (RSAT)",
      flags: [
        { flag: "-Identity", description: "Usuario, equipo o grupo que se consulta." },
        { flag: "Compare-Object", description: "Compara los grupos de dos usuarios." }
      ],
      example: { command: "Compare-Object (Get-ADPrincipalGroupMembership jlopez).Name (Get-ADPrincipalGroupMembership aruiz).Name", explanation: "«Dame los mismos permisos que a mi compañera»: compara los grupos de los dos usuarios para ver exactamente cuáles le faltan." },
      tags: ["grupos del usuario", "pertenencia", "permisos", "comparar", "memberof"]
    },
    {
      id: "win-restore-adobject", name: "Restore-ADObject", os: "windows", shell: "powershell", category: "ad", risk: "caution",
      description: "Recupera usuarios, grupos o unidades organizativas borrados, desde la papelera de reciclaje de AD.",
      syntax: "Get-ADObject -Filter 'isDeleted -eq $true' -IncludeDeletedObjects | Restore-ADObject [-NewName <nombre>] [-TargetPath <OU>]",
      requires: "Papelera de reciclaje de AD habilitada antes del borrado",
      flags: [
        { flag: "-IncludeDeletedObjects", description: "Incluye los objetos borrados en la búsqueda." },
        { flag: "-TargetPath", description: "Restaura en otra unidad organizativa." },
        { flag: "-NewName", description: "Restaura con otro nombre si hay conflicto." }
      ],
      example: { command: "Get-ADObject -Filter 'samAccountName -eq \"jlopez\" -and isDeleted -eq $true' -IncludeDeletedObjects -Properties whenChanged | Restore-ADObject", explanation: "Se ha borrado por error la cuenta de un usuario: la recupera con sus grupos y atributos, sin tener que crearla de nuevo." },
      tags: ["recuperar", "borrado", "papelera de reciclaje", "restaurar usuario"]
    },

    // ---------------------------------------------------------------- Segunda tanda de Linux y Windows (v1.9.0)
    {
      id: "linux-chsh", name: "chsh / chfn", os: "linux", shell: "bash", category: "users", risk: "caution",
      description: "Cambia la shell de inicio de un usuario y sus datos descriptivos.",
      syntax: "chsh -s shell [usuario] | chsh -l | chfn -f \"Nombre\" usuario",
      flags: [
        { flag: "-s /bin/bash", description: "Shell nueva; debe figurar en /etc/shells." },
        { flag: "-s /usr/sbin/nologin", description: "Impide el inicio de sesión interactivo." },
        { flag: "chfn -f", description: "Nombre completo que muestran finger y el correo." }
      ],
      example: { command: "sudo chsh -s /usr/sbin/nologin svc_backup && getent passwd svc_backup", explanation: "Una cuenta de servicio no debe poder abrir sesión: le quita la shell y comprueba el resultado." },
      tags: ["shell", "nologin", "cuenta de servicio", "bash"]
    },
    {
      id: "linux-getent", name: "getent", os: "linux", shell: "bash", category: "users", risk: "safe",
      description: "Consulta usuarios, grupos y nombres tal como los resuelve el sistema, incluidos LDAP, SSSD o Active Directory.",
      syntax: "getent passwd|group|hosts|services [clave]",
      flags: [
        { flag: "passwd usuario", description: "Datos de la cuenta, venga de donde venga." },
        { flag: "group grupo", description: "Miembros del grupo." },
        { flag: "hosts nombre", description: "Resolución según /etc/nsswitch.conf." }
      ],
      example: { command: "getent passwd jlopez && getent group contabilidad && getent hosts srv01.corp.local", explanation: "Comprueba que un servidor unido al dominio ve al usuario y al grupo: si getent no los devuelve, el fallo está en SSSD y no en los permisos." },
      tags: ["ldap", "sssd", "nsswitch", "usuario del dominio", "resolver"]
    },
    {
      id: "linux-loginctl", name: "loginctl", os: "linux", shell: "bash", category: "users", risk: "caution",
      description: "Lista las sesiones abiertas y permite cerrarlas o dejar servicios de usuario activos sin sesión.",
      syntax: "loginctl list-sessions | show-user usuario | terminate-session ID | enable-linger usuario",
      flags: [
        { flag: "list-sessions", description: "Sesiones con usuario, terminal y origen." },
        { flag: "terminate-session", description: "Cierra una sesión concreta." },
        { flag: "enable-linger", description: "Mantiene los servicios del usuario tras cerrar sesión." }
      ],
      example: { command: "loginctl list-sessions && sudo loginctl enable-linger deploy", explanation: "Permite que los contenedores de Podman del usuario deploy sigan en marcha aunque nadie tenga sesión abierta." },
      tags: ["sesiones", "linger", "systemd", "cerrar sesion"]
    },
    {
      id: "linux-pwck", name: "pwck / grpck", os: "linux", shell: "bash", category: "users", risk: "caution",
      description: "Comprueba la coherencia de /etc/passwd, /etc/shadow y /etc/group.",
      syntax: "pwck [-r] | grpck [-r]",
      flags: [
        { flag: "-r", description: "Solo lectura: informa sin proponer cambios." },
        { flag: "-s", description: "Ordena las entradas por UID o GID." }
      ],
      example: { command: "sudo pwck -r; sudo grpck -r", explanation: "Tras editar cuentas a mano o migrar usuarios entre servidores, detecta entradas duplicadas, homes que no existen y grupos huérfanos." },
      tags: ["passwd", "shadow", "integridad", "comprobar cuentas"]
    },
    {
      id: "linux-locate", name: "locate / updatedb", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Busca archivos por nombre al instante usando un índice, mucho más rápido que find.",
      syntax: "locate [-i] [-c] [-r regex] patrón | updatedb",
      requires: "sudo apt install plocate",
      flags: [
        { flag: "-i", description: "No distingue mayúsculas." },
        { flag: "-c", description: "Solo cuenta los resultados." },
        { flag: "updatedb", description: "Actualiza el índice (se ejecuta a diario)." }
      ],
      example: { command: "sudo updatedb && locate -i \"php.ini\"", explanation: "Encuentra todos los php.ini del servidor en un segundo. Si el archivo es de hoy, actualiza antes el índice." },
      tags: ["buscar archivo", "indice", "plocate", "nombre"]
    },
    {
      id: "linux-tree", name: "tree", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Muestra el contenido de una carpeta en forma de árbol.",
      syntax: "tree [-L niveles] [-d] [-a] [-h] [-I patrón] [ruta]",
      requires: "sudo apt install tree",
      flags: [
        { flag: "-L 2", description: "Limita la profundidad." },
        { flag: "-d", description: "Solo directorios." },
        { flag: "-I 'node_modules|.git'", description: "Excluye lo que coincida." }
      ],
      example: { command: "tree -L 2 -d /etc/apache2", explanation: "Vistazo rápido a cómo está organizada la configuración de Apache antes de tocarla, o para documentarla." },
      tags: ["arbol", "estructura", "carpetas", "listar"]
    },
    {
      id: "linux-basename", name: "basename / dirname", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Extraen el nombre del archivo o la carpeta que lo contiene a partir de una ruta.",
      syntax: "basename ruta [sufijo] | dirname ruta",
      flags: [
        { flag: "basename ruta .log", description: "Nombre sin la extensión indicada." },
        { flag: "dirname ruta", description: "Carpeta que contiene el archivo." },
        { flag: "\"$(dirname \"$0\")\"", description: "Carpeta del propio script." }
      ],
      example: { command: "for f in /var/log/apache2/*.log; do cp \"$f\" \"/backups/$(basename \"$f\" .log)-$(date +%F).log\"; done", explanation: "Copia cada log con la fecha en el nombre, conservando el nombre original sin la extensión." },
      tags: ["ruta", "nombre de archivo", "script", "extension"]
    },
    {
      id: "linux-realpath", name: "realpath / readlink", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Resuelven enlaces simbólicos y rutas relativas hasta la ruta real y absoluta.",
      syntax: "realpath ruta | readlink [-f] enlace",
      flags: [
        { flag: "realpath", description: "Ruta absoluta sin enlaces ni «..»." },
        { flag: "readlink", description: "A dónde apunta un enlace, tal cual." },
        { flag: "readlink -f", description: "Sigue toda la cadena de enlaces." }
      ],
      example: { command: "readlink -f /etc/alternatives/java && realpath /var/www/html/current", explanation: "Averigua qué Java se usa de verdad tras varios enlaces y a qué versión apunta el enlace «current» de un despliegue." },
      tags: ["enlace simbolico", "ruta absoluta", "symlink", "resolver"]
    },
    {
      id: "linux-xz", name: "xz / bzip2", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Compresores con mejor ratio que gzip, a cambio de más tiempo de CPU.",
      syntax: "xz [-k] [-T0] [-9] archivo | xz -d archivo.xz | bzip2 [-k] archivo",
      flags: [
        { flag: "-k", description: "Conserva el archivo original." },
        { flag: "-T0", description: "Usa todos los núcleos (solo xz)." },
        { flag: "-d", description: "Descomprime." }
      ],
      example: { command: "xz -k -T0 /backups/bd-20261108.sql && ls -lh /backups/bd-20261108.sql*", explanation: "Comprime un volcado grande de base de datos para archivarlo: ocupa bastante menos que con gzip." },
      tags: ["comprimir", "xz", "bz2", "archivar"]
    },
    {
      id: "linux-7z", name: "7z", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Crea y extrae archivos 7z y zip, con cifrado AES-256 y contraseña.",
      syntax: "7z a [-p] [-mhe=on] archivo.7z rutas | 7z x archivo [-o destino] | 7z l archivo",
      requires: "sudo apt install p7zip-full",
      flags: [
        { flag: "a", description: "Añade archivos a un archivo comprimido." },
        { flag: "x -o/ruta", description: "Extrae conservando las carpetas." },
        { flag: "-p -mhe=on", description: "Pide contraseña y cifra también los nombres." }
      ],
      example: { command: "7z a -p -mhe=on /tmp/nominas-2026.7z /srv/rrhh/nominas/2026", explanation: "Empaqueta documentos sensibles con contraseña antes de enviarlos; ni siquiera se ven los nombres de los archivos." },
      tags: ["7zip", "cifrar", "contraseña", "comprimir"]
    },
    {
      id: "linux-rename", name: "rename", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Renombra muchos archivos a la vez con una expresión regular.",
      syntax: "rename [-n] [-v] 's/patrón/reemplazo/' archivos",
      requires: "sudo apt install rename",
      flags: [
        { flag: "-n", description: "Simula: muestra qué haría sin renombrar." },
        { flag: "-v", description: "Muestra cada cambio." },
        { flag: "'y/A-Z/a-z/'", description: "Pasa los nombres a minúsculas." }
      ],
      example: { command: "rename -n 's/\\.jpeg$/.jpg/' *.jpeg && rename -v 's/\\.jpeg$/.jpg/' *.jpeg", explanation: "Unifica la extensión de cientos de imágenes: primero simula con -n y, si el resultado es el esperado, lo aplica." },
      tags: ["renombrar", "masivo", "regex", "extension"]
    },
    {
      id: "linux-shred", name: "shred", os: "linux", shell: "bash", category: "filesystem", risk: "danger",
      description: "Sobrescribe un archivo o un disco varias veces para que no pueda recuperarse.",
      syntax: "shred [-n pasadas] [-z] [-u] [-v] archivo|dispositivo",
      flags: [
        { flag: "-u", description: "Borra el archivo al terminar." },
        { flag: "-n 3", description: "Número de pasadas." },
        { flag: "-z", description: "Última pasada con ceros." }
      ],
      example: { command: "shred -u -n 3 -z -v /root/claves-antiguas.txt", explanation: "Elimina de forma segura un archivo con credenciales. En SSD y sistemas con instantáneas no es fiable: ahí lo correcto es cifrar el disco." },
      tags: ["borrado seguro", "sobrescribir", "destruir", "wipe"]
    },
    {
      id: "linux-truncate", name: "truncate / fallocate", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Vacía o cambia el tamaño de un archivo sin borrarlo, y reserva espacio de golpe.",
      syntax: "truncate -s tamaño archivo | fallocate -l tamaño archivo",
      flags: [
        { flag: "truncate -s 0", description: "Vacía el archivo conservando permisos e inodo." },
        { flag: "truncate -s 100M", description: "Ajusta el tamaño a 100 MB." },
        { flag: "fallocate -l 4G", description: "Reserva 4 GB de inmediato." }
      ],
      example: { command: "sudo truncate -s 0 /var/log/app/debug.log && df -h /var/log", explanation: "Un log ha llenado el disco y el proceso lo tiene abierto: vaciarlo libera el espacio al instante, cosa que borrarlo no haría." },
      tags: ["vaciar log", "disco lleno", "tamaño", "reservar espacio"]
    },
    {
      id: "linux-column", name: "column", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Alinea texto en columnas para leerlo como una tabla.",
      syntax: "comando | column -t [-s separador] [-N cabeceras]",
      flags: [
        { flag: "-t", description: "Formato de tabla." },
        { flag: "-s ':'", description: "Separador de la entrada." },
        { flag: "-N a,b,c", description: "Añade cabeceras." }
      ],
      example: { command: "column -t -s ':' -N usuario,x,uid,gid,nombre,home,shell /etc/passwd | head -n 15", explanation: "Convierte /etc/passwd en una tabla legible con cabeceras; el mismo truco sirve con cualquier CSV." },
      tags: ["tabla", "alinear", "columnas", "csv", "formato"]
    },
    {
      id: "linux-paste", name: "paste / join", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Combinan archivos por líneas: uno al lado del otro o cruzándolos por un campo común.",
      syntax: "paste [-d sep] [-s] archivos | join [-t sep] [-1 N -2 N] archivo1 archivo2",
      flags: [
        { flag: "paste -d ','", description: "Une las líneas con ese separador." },
        { flag: "paste -s", description: "Convierte una columna en una sola línea." },
        { flag: "join -t ','", description: "Cruza dos archivos ordenados por su primer campo." }
      ],
      example: { command: "cut -d: -f1 /etc/passwd | paste -s -d ','", explanation: "Convierte la lista de usuarios, uno por línea, en una sola línea separada por comas para pegarla en otro comando o en una hoja de cálculo." },
      tags: ["unir", "combinar", "columnas", "cruzar archivos"]
    },
    {
      id: "linux-iconv", name: "iconv / dos2unix", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Convierten la codificación de un texto y los finales de línea de Windows a Unix.",
      syntax: "iconv -f origen -t destino archivo > salida | dos2unix archivo | file archivo",
      requires: "dos2unix: sudo apt install dos2unix",
      flags: [
        { flag: "-f ISO-8859-1 -t UTF-8", description: "De Latin-1 a UTF-8." },
        { flag: "dos2unix", description: "Quita los retornos de carro (CRLF → LF)." },
        { flag: "file", description: "Indica la codificación y el tipo de final de línea." }
      ],
      example: { command: "file clientes.csv && iconv -f ISO-8859-1 -t UTF-8 clientes.csv > clientes-utf8.csv && dos2unix deploy.sh", explanation: "Un CSV exportado desde Windows muestra mal las tildes y un script falla con «bad interpreter»: arregla la codificación y los finales de línea." },
      tags: ["codificacion", "utf-8", "crlf", "tildes", "finales de linea"]
    },
    {
      id: "linux-xxd", name: "xxd / strings", os: "linux", shell: "bash", category: "filesystem", risk: "safe",
      description: "Muestran el contenido de un archivo binario en hexadecimal o solo su texto legible.",
      syntax: "xxd [-l bytes] [-s desplazamiento] archivo | strings [-n longitud] archivo",
      flags: [
        { flag: "xxd -l 64", description: "Solo los primeros 64 bytes." },
        { flag: "strings -n 8", description: "Cadenas de al menos 8 caracteres." },
        { flag: "xxd -r", description: "Convierte un volcado hexadecimal de vuelta a binario." }
      ],
      example: { command: "xxd -l 32 descarga.bin && strings -n 8 /usr/local/bin/agente | grep -i -E \"http|version\"", explanation: "Identifica un archivo desconocido por su cabecera y busca dentro de un binario la versión o las URL a las que se conecta." },
      tags: ["hexadecimal", "binario", "cabecera", "analizar archivo"]
    },
    {
      id: "linux-vim", name: "vim", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Editor de texto presente en casi cualquier servidor. Tiene modos: normal, inserción y órdenes.",
      syntax: "vim [+línea] archivo | vim -d archivo1 archivo2",
      flags: [
        { flag: "i / Esc", description: "Entra en inserción / vuelve al modo normal." },
        { flag: ":wq / :q!", description: "Guarda y sale / sale sin guardar." },
        { flag: "/texto, n", description: "Busca y salta a la siguiente coincidencia." },
        { flag: ":%s/a/b/g", description: "Sustituye en todo el archivo." }
      ],
      example: { command: "sudo vim +42 /etc/ssh/sshd_config", explanation: "Abre el archivo directamente en la línea que señala el mensaje de error. Para salir sin tocar nada: Esc y «:q!»." },
      tags: ["editor", "vi", "editar archivo", "salir de vim"]
    },
    {
      id: "linux-nano", name: "nano", os: "linux", shell: "bash", category: "filesystem", risk: "caution",
      description: "Editor de texto sencillo, con los atajos siempre visibles en la parte inferior.",
      syntax: "nano [-l] [-B] [+línea] archivo",
      flags: [
        { flag: "Ctrl+O / Ctrl+X", description: "Guarda / sale." },
        { flag: "Ctrl+W", description: "Busca texto." },
        { flag: "-l", description: "Muestra los números de línea." },
        { flag: "-B", description: "Guarda una copia del original (archivo~)." }
      ],
      example: { command: "sudo nano -l -B /etc/hosts", explanation: "Edita un archivo de configuración dejando una copia de seguridad automática por si hay que volver atrás." },
      tags: ["editor", "editar archivo", "sencillo", "configuracion"]
    },
    {
      id: "linux-host", name: "host / nslookup", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Consultas DNS rápidas: nombre a IP, IP a nombre y registros concretos.",
      syntax: "host [-t tipo] nombre [servidor] | nslookup nombre [servidor]",
      flags: [
        { flag: "-t MX", description: "Servidores de correo del dominio." },
        { flag: "host IP", description: "Resolución inversa." },
        { flag: "nombre servidor", description: "Pregunta a un DNS concreto." }
      ],
      example: { command: "host -t MX empresa.com && host srv01.corp.local 192.168.10.10", explanation: "Comprueba el correo de un dominio y si el DNS interno resuelve un servidor, preguntándole directamente." },
      tags: ["dns", "resolver", "mx", "inversa"]
    },
    {
      id: "linux-whois", name: "whois", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Consulta quién registró un dominio o a qué organización pertenece una dirección IP.",
      syntax: "whois dominio|IP",
      requires: "sudo apt install whois",
      flags: [
        { flag: "dominio", description: "Registrador, fechas y servidores de nombres." },
        { flag: "IP", description: "Operador, país y contacto de abuso." }
      ],
      example: { command: "whois empresa.com | grep -i -E \"expir|registrar:\" && whois 203.0.113.50 | grep -i -E \"country|abuse\"", explanation: "Comprueba cuándo caduca el dominio de la empresa y de qué operador es una IP que está atacando el servidor, para denunciarla." },
      tags: ["dominio", "caducidad", "registrador", "ip", "abuso"]
    },
    {
      id: "linux-ip-neigh", name: "ip neigh / arp", os: "linux", shell: "bash", category: "network", risk: "caution",
      description: "Muestra y limpia la tabla de vecinos: qué dirección MAC corresponde a cada IP de la red local.",
      syntax: "ip neigh [show dev interfaz] | ip neigh flush all | arp -n",
      flags: [
        { flag: "show", description: "Entradas con su estado (REACHABLE, STALE, FAILED)." },
        { flag: "flush all", description: "Vacía la tabla." },
        { flag: "arp -n", description: "Formato clásico, sin resolver nombres." }
      ],
      example: { command: "ip neigh show dev ens18 | grep -i \"192.168.10.1 \"", explanation: "Si la puerta de enlace aparece en FAILED o con una MAC distinta de la habitual, hay un problema de capa 2 o una IP duplicada." },
      tags: ["arp", "mac", "vecinos", "ip duplicada", "capa 2"]
    },
    {
      id: "linux-ssh-tunnel", name: "ssh -L / -R / -D (túneles)", os: "linux", shell: "bash", category: "network", risk: "caution",
      description: "Reenvía puertos a través de SSH para llegar a servicios que no están expuestos.",
      syntax: "ssh -L local:destino:puerto usuario@salto | ssh -R remoto:destino:puerto usuario@servidor | ssh -D puerto usuario@salto",
      flags: [
        { flag: "-L 3307:127.0.0.1:3306", description: "Puerto local que lleva a un servicio del otro lado." },
        { flag: "-R", description: "Publica en el servidor un puerto de tu equipo." },
        { flag: "-D 1080", description: "Proxy SOCKS dinámico." },
        { flag: "-N -f", description: "Solo el túnel, en segundo plano." }
      ],
      example: { command: "ssh -N -f -L 3307:127.0.0.1:3306 admin@srv01.corp.local && mariadb -h 127.0.0.1 -P 3307 -u informes -p", explanation: "Accede a una base de datos que solo escucha en localhost del servidor, sin abrir el puerto 3306 al exterior." },
      tags: ["tunel", "reenvio de puertos", "port forwarding", "socks", "bastion"]
    },
    {
      id: "linux-ssh-config", name: "~/.ssh/config (ProxyJump)", os: "linux", shell: "bash", category: "network", risk: "caution",
      description: "Define alias, usuario, clave y saltos para cada servidor y evita escribir opciones largas.",
      syntax: "Host alias\n  HostName servidor\n  User usuario\n  IdentityFile clave\n  ProxyJump salto",
      flags: [
        { flag: "HostName / User / Port", description: "Datos reales de la conexión." },
        { flag: "IdentityFile", description: "Clave privada que se usa con ese servidor." },
        { flag: "ProxyJump", description: "Pasa por un servidor de salto." },
        { flag: "ssh -G alias", description: "Muestra la configuración que se aplicaría." }
      ],
      example: { command: "cat >> ~/.ssh/config <<'EOF'\nHost bd-interna\n  HostName 192.168.10.20\n  User admin\n  IdentityFile ~/.ssh/id_ed25519\n  ProxyJump admin@srv01.corp.local\nEOF\nchmod 600 ~/.ssh/config && ssh bd-interna", explanation: "Con un alias entras en un servidor interno pasando por el bastión; scp, rsync y Ansible usan la misma configuración." },
      tags: ["alias", "bastion", "salto", "proxyjump", "configuracion ssh"]
    },
    {
      id: "linux-sshfs", name: "sshfs", os: "linux", shell: "bash", category: "network", risk: "caution",
      description: "Monta una carpeta remota por SSH como si fuera local, sin configurar NFS ni Samba.",
      syntax: "sshfs usuario@servidor:/ruta punto_de_montaje [-o opciones] | fusermount -u punto_de_montaje",
      requires: "sudo apt install sshfs",
      flags: [
        { flag: "-o reconnect", description: "Reconecta si se corta la red." },
        { flag: "-o ro", description: "Solo lectura." },
        { flag: "fusermount -u", description: "Desmonta." }
      ],
      example: { command: "mkdir -p ~/srv01-logs && sshfs -o ro,reconnect admin@srv01.corp.local:/var/log ~/srv01-logs", explanation: "Revisa los logs de un servidor con las herramientas de tu equipo, en solo lectura para no tocar nada por error." },
      tags: ["montar remoto", "ssh", "fuse", "carpeta remota"]
    },
    {
      id: "linux-wg", name: "wg / wg-quick", os: "linux", shell: "bash", category: "network", risk: "caution",
      description: "Gestiona túneles VPN de WireGuard: los levanta, los baja y muestra su estado.",
      syntax: "wg show | wg-quick up|down interfaz | wg genkey | tee privada.key | wg pubkey > publica.key",
      requires: "sudo apt install wireguard",
      flags: [
        { flag: "wg show", description: "Pares, último contacto y tráfico." },
        { flag: "wg-quick up wg0", description: "Levanta el túnel de /etc/wireguard/wg0.conf." },
        { flag: "systemctl enable wg-quick@wg0", description: "Lo arranca con el sistema." }
      ],
      example: { command: "sudo wg-quick up wg0 && sudo wg show wg0 latest-handshakes", explanation: "Levanta la VPN entre sedes y comprueba que hay contacto reciente con el otro extremo: sin él, revisa claves, puerto UDP y cortafuegos." },
      tags: ["vpn", "wireguard", "tunel", "sedes"]
    },
    {
      id: "linux-iftop", name: "iftop / nethogs", os: "linux", shell: "bash", category: "network", risk: "safe",
      description: "Muestran en vivo quién consume el ancho de banda: por conexión (iftop) o por proceso (nethogs).",
      syntax: "iftop -i interfaz [-n] [-P] | nethogs [interfaz]",
      requires: "sudo apt install iftop nethogs",
      flags: [
        { flag: "iftop -n", description: "Sin resolver nombres." },
        { flag: "iftop -P", description: "Muestra los puertos." },
        { flag: "nethogs", description: "Tráfico agrupado por proceso." }
      ],
      example: { command: "sudo iftop -i ens18 -n -P", explanation: "La red del servidor va saturada: identifica en segundos qué IP y qué puerto se llevan el tráfico." },
      tags: ["ancho de banda", "trafico", "consumo de red", "en vivo"]
    },
    {
      id: "linux-socat", name: "socat", os: "linux", shell: "bash", category: "network", risk: "caution",
      description: "Conecta dos flujos de datos cualesquiera: puertos, sockets Unix, archivos o TLS. Un netcat con más opciones.",
      syntax: "socat origen destino",
      requires: "sudo apt install socat",
      flags: [
        { flag: "TCP-LISTEN:8080,fork", description: "Escucha y atiende varias conexiones." },
        { flag: "TCP:host:puerto", description: "Conecta con un destino." },
        { flag: "UNIX-CONNECT:/ruta.sock", description: "Habla con un socket Unix." }
      ],
      example: { command: "socat TCP-LISTEN:8080,fork,reuseaddr TCP:192.168.10.20:80", explanation: "Reenvío temporal de un puerto hacia otro servidor mientras se migra un servicio, sin tocar el cortafuegos ni instalar un proxy." },
      tags: ["reenvio", "relay", "socket", "puente", "netcat"]
    },
    {
      id: "linux-w", name: "w", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Muestra quién tiene sesión abierta, desde dónde y qué está ejecutando, junto con la carga del sistema.",
      syntax: "w [-h] [-i] [usuario]",
      flags: [
        { flag: "-h", description: "Sin la cabecera." },
        { flag: "-i", description: "Muestra la IP de origen en lugar del nombre." },
        { flag: "usuario", description: "Solo las sesiones de ese usuario." }
      ],
      example: { command: "w -i", explanation: "Antes de reiniciar un servidor, comprueba quién está conectado y qué está haciendo para avisarle." },
      tags: ["sesiones", "conectados", "quien", "carga"]
    },
    {
      id: "linux-killall", name: "killall", os: "linux", shell: "bash", category: "processes", risk: "danger",
      description: "Envía una señal a todos los procesos que tienen un nombre dado.",
      syntax: "killall [-señal] [-u usuario] [-i] [-w] nombre",
      flags: [
        { flag: "-u usuario", description: "Solo los procesos de ese usuario." },
        { flag: "-i", description: "Pide confirmación para cada proceso." },
        { flag: "-9", description: "Fuerza el cierre (SIGKILL), sin limpieza." }
      ],
      example: { command: "pgrep -a php-fpm && sudo killall -i -u www-data php-fpm", explanation: "Cierra los procesos colgados de un servicio. Mira antes con pgrep qué va a morir: un nombre demasiado genérico se lleva por delante más de lo previsto." },
      tags: ["matar procesos", "señal", "sigkill", "por nombre"]
    },
    {
      id: "linux-systemd-analyze", name: "systemd-analyze", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Analiza el arranque del sistema: cuánto tarda y qué servicios lo retrasan.",
      syntax: "systemd-analyze [blame | critical-chain | verify unidad | security unidad]",
      flags: [
        { flag: "blame", description: "Servicios ordenados por tiempo de arranque." },
        { flag: "critical-chain", description: "Cadena de dependencias que marca el tiempo total." },
        { flag: "verify", description: "Comprueba la sintaxis de una unidad." }
      ],
      example: { command: "systemd-analyze && systemd-analyze blame | head -n 10", explanation: "El servidor tarda en arrancar tras un reinicio: muestra el tiempo total y los diez servicios más lentos." },
      tags: ["arranque", "boot", "lento", "servicios", "systemd"]
    },
    {
      id: "linux-modprobe", name: "lsmod / modprobe", os: "linux", shell: "bash", category: "processes", risk: "caution",
      description: "Lista, carga y descarga módulos del kernel (controladores).",
      syntax: "lsmod | modinfo módulo | modprobe módulo | modprobe -r módulo",
      flags: [
        { flag: "lsmod", description: "Módulos cargados y quién los usa." },
        { flag: "modinfo", description: "Versión, parámetros y dependencias." },
        { flag: "modprobe -r", description: "Descarga el módulo." }
      ],
      example: { command: "lsmod | grep -E \"^(br_netfilter|overlay)\" || sudo modprobe -a overlay br_netfilter", explanation: "Carga los módulos que necesita Kubernetes si no lo están. Para que persistan, añádelos a /etc/modules-load.d/." },
      tags: ["modulos", "kernel", "controladores", "driver"]
    },
    {
      id: "linux-lspci", name: "lspci / lsusb", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Listan los dispositivos PCI y USB que detecta el sistema y el controlador que usan.",
      syntax: "lspci [-k] [-nn] [-v] | lsusb [-t] [-v]",
      requires: "sudo apt install pciutils usbutils",
      flags: [
        { flag: "lspci -k", description: "Controlador del kernel que usa cada dispositivo." },
        { flag: "lspci -nn", description: "Identificadores de fabricante y modelo." },
        { flag: "lsusb -t", description: "Árbol de puertos USB con su velocidad." }
      ],
      example: { command: "lspci -k | grep -A 3 -i ethernet", explanation: "Una tarjeta de red no aparece: comprueba si el sistema la ve y si tiene controlador cargado." },
      tags: ["hardware", "dispositivos", "pci", "usb", "controlador"]
    },
    {
      id: "linux-time", name: "time", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Mide cuánto tarda un comando y cuánta CPU consume.",
      syntax: "time comando | /usr/bin/time -v comando",
      flags: [
        { flag: "real", description: "Tiempo total transcurrido." },
        { flag: "user / sys", description: "CPU en el programa / en el kernel." },
        { flag: "/usr/bin/time -v", description: "Añade memoria máxima y E/S." }
      ],
      example: { command: "time mariadb-dump --single-transaction tienda | gzip > /backups/tienda.sql.gz", explanation: "Mide cuánto tarda la copia de la base de datos para saber si cabe en la ventana de mantenimiento." },
      tags: ["medir tiempo", "duracion", "rendimiento", "cronometrar"]
    },
    {
      id: "linux-timeout", name: "timeout", os: "linux", shell: "bash", category: "processes", risk: "caution",
      description: "Ejecuta un comando y lo detiene si supera un tiempo límite.",
      syntax: "timeout [-k gracia] [-s señal] duración comando",
      flags: [
        { flag: "30s / 5m / 2h", description: "Duración máxima." },
        { flag: "-k 10s", description: "Si no termina, lo mata 10 s después." },
        { flag: "código 124", description: "Código de salida cuando se agota el tiempo." }
      ],
      example: { command: "timeout -k 10s 5m rsync -a /srv/datos/ backup@srv02:/backups/datos/ || echo \"La copia no terminó a tiempo\"", explanation: "Evita que una tarea de cron se quede colgada indefinidamente y se solape con la siguiente ejecución." },
      tags: ["limite de tiempo", "colgado", "cron", "matar"]
    },
    {
      id: "linux-sar", name: "sar", os: "linux", shell: "bash", category: "processes", risk: "safe",
      description: "Muestra el histórico de CPU, memoria, disco y red recogido por sysstat.",
      syntax: "sar [-u|-r|-d|-n DEV] [-s inicio] [-e fin] [-f archivo] [intervalo veces]",
      requires: "sudo apt install sysstat && sudo systemctl enable --now sysstat",
      flags: [
        { flag: "-u", description: "Uso de CPU." },
        { flag: "-r", description: "Memoria." },
        { flag: "-n DEV", description: "Tráfico por interfaz." },
        { flag: "-s 03:00 -e 04:00", description: "Solo esa franja horaria." }
      ],
      example: { command: "sar -u -s 03:00:00 -e 04:00:00 && sar -r -s 03:00:00 -e 04:00:00", explanation: "«Anoche a las tres la web iba lenta»: revisa cómo estaban la CPU y la memoria en esa hora, aunque nadie estuviera mirando." },
      tags: ["historico", "sysstat", "rendimiento pasado", "cpu", "memoria"]
    },
    {
      id: "linux-systemd-run", name: "systemd-run", os: "linux", shell: "bash", category: "processes", risk: "caution",
      description: "Lanza un comando como unidad transitoria de systemd, con límites de recursos y registro en el journal.",
      syntax: "systemd-run [--unit nombre] [-p Propiedad=valor] [--on-calendar=...] [--scope] comando",
      flags: [
        { flag: "-p MemoryMax=2G", description: "Límite de memoria." },
        { flag: "-p CPUQuota=50%", description: "Límite de CPU." },
        { flag: "--on-active=30m", description: "Lo ejecuta dentro de 30 minutos." }
      ],
      example: { command: "sudo systemd-run --unit reindexar -p MemoryMax=2G -p CPUQuota=50% /usr/local/bin/reindexar.sh && journalctl -u reindexar -f", explanation: "Lanza una tarea pesada en horario laboral sin que se coma el servidor, y sigue su salida en el journal." },
      tags: ["limitar recursos", "cgroups", "transitorio", "memoria", "cpu"]
    },
    {
      id: "linux-firewall-cmd", name: "firewall-cmd", os: "linux", shell: "bash", category: "security", risk: "caution",
      description: "Gestiona firewalld, el cortafuegos por zonas de RHEL, Rocky, Alma y Fedora.",
      syntax: "firewall-cmd --list-all | --add-service=nombre | --add-port=N/tcp [--permanent] | --reload",
      flags: [
        { flag: "--list-all", description: "Reglas de la zona activa." },
        { flag: "--permanent", description: "Guarda el cambio (hay que recargar)." },
        { flag: "--reload", description: "Aplica la configuración permanente." }
      ],
      example: { command: "sudo firewall-cmd --permanent --add-service=https && sudo firewall-cmd --reload && sudo firewall-cmd --list-all", explanation: "Abre HTTPS de forma permanente y comprueba el resultado. Sin --permanent el cambio se pierde al reiniciar." },
      tags: ["cortafuegos", "firewalld", "zonas", "rhel", "abrir puerto"]
    },
    {
      id: "linux-aa-status", name: "aa-status / aa-complain", os: "linux", shell: "bash", category: "security", risk: "caution",
      description: "Consulta AppArmor, el control de acceso obligatorio de Ubuntu, y pasa perfiles a modo permisivo.",
      syntax: "aa-status | aa-complain perfil | aa-enforce perfil",
      requires: "aa-complain: sudo apt install apparmor-utils",
      flags: [
        { flag: "aa-status", description: "Perfiles cargados y en qué modo." },
        { flag: "aa-complain", description: "Registra las denegaciones sin bloquear." },
        { flag: "aa-enforce", description: "Vuelve a aplicar el perfil." }
      ],
      example: { command: "sudo aa-status | head -n 8 && sudo journalctl -k --since \"1 hour ago\" | grep -i \"apparmor=\\\"DENIED\\\"\" | tail -n 5", explanation: "Un servicio no puede leer un archivo aunque los permisos son correctos: comprueba si AppArmor lo está bloqueando." },
      tags: ["apparmor", "perfiles", "denegado", "ubuntu", "mac"]
    },
    {
      id: "linux-lynis", name: "lynis", os: "linux", shell: "bash", category: "security", risk: "safe",
      description: "Audita la seguridad del sistema y propone mejoras de configuración ordenadas por prioridad.",
      syntax: "lynis audit system [--quick] | lynis show details ID",
      requires: "sudo apt install lynis",
      flags: [
        { flag: "audit system", description: "Auditoría completa del equipo." },
        { flag: "--quick", description: "No se detiene entre secciones." },
        { flag: "show details", description: "Explica una recomendación concreta." }
      ],
      example: { command: "sudo lynis audit system --quick | tee ~/lynis-$(date +%F).txt | tail -n 40", explanation: "Revisión de seguridad de un servidor antes de ponerlo en producción: guarda el informe y muestra la puntuación y las sugerencias." },
      tags: ["auditoria", "hardening", "bastionado", "recomendaciones"]
    },
    {
      id: "linux-rkhunter", name: "rkhunter / chkrootkit", os: "linux", shell: "bash", category: "security", risk: "safe",
      description: "Buscan rootkits, puertas traseras y binarios del sistema modificados.",
      syntax: "rkhunter --check [--sk] [--rwo] | rkhunter --propupd | chkrootkit",
      requires: "sudo apt install rkhunter chkrootkit",
      flags: [
        { flag: "--check --sk", description: "Análisis completo sin pausas." },
        { flag: "--rwo", description: "Muestra solo los avisos." },
        { flag: "--propupd", description: "Actualiza la referencia tras cambios legítimos." }
      ],
      example: { command: "sudo rkhunter --check --sk --rwo", explanation: "Ante la sospecha de que un servidor está comprometido, hace un primer análisis. Puede dar falsos positivos tras una actualización de paquetes." },
      tags: ["rootkit", "malware", "comprometido", "intrusion"]
    },
    {
      id: "linux-auditctl", name: "auditctl", os: "linux", shell: "bash", category: "security", risk: "caution",
      description: "Define qué vigila el subsistema de auditoría: accesos a archivos y llamadas al sistema.",
      syntax: "auditctl -l | auditctl -w ruta -p permisos -k etiqueta | auditctl -D",
      requires: "sudo apt install auditd",
      flags: [
        { flag: "-w ruta", description: "Archivo o carpeta que se vigila." },
        { flag: "-p wa", description: "Escrituras y cambios de atributos." },
        { flag: "-k etiqueta", description: "Etiqueta para buscar después con ausearch." }
      ],
      example: { command: "sudo auditctl -w /etc/sudoers -p wa -k cambios-sudo && sudo ausearch -k cambios-sudo -ts today", explanation: "Registra quién modifica el archivo sudoers. Para que la regla sobreviva a un reinicio, guárdala en /etc/audit/rules.d/." },
      tags: ["auditoria", "vigilar archivo", "auditd", "quien modifico"]
    },
    {
      id: "linux-setcap", name: "getcap / setcap", os: "linux", shell: "bash", category: "security", risk: "caution",
      description: "Consultan y asignan capacidades a un binario para darle un privilegio concreto sin ejecutarlo como root.",
      syntax: "getcap [-r] ruta | setcap capacidad+ep binario | setcap -r binario",
      flags: [
        { flag: "cap_net_bind_service+ep", description: "Permite abrir puertos por debajo del 1024." },
        { flag: "getcap -r /", description: "Busca binarios con capacidades." },
        { flag: "setcap -r", description: "Quita las capacidades." }
      ],
      example: { command: "sudo setcap cap_net_bind_service+ep /opt/app/servidor && getcap /opt/app/servidor", explanation: "Una aplicación propia necesita escuchar en el puerto 443 sin ser root: le da solo ese privilegio." },
      tags: ["capacidades", "puerto privilegiado", "sin root", "privilegios"]
    },
    {
      id: "linux-cryptsetup", name: "cryptsetup (LUKS)", os: "linux", shell: "bash", category: "security", risk: "danger",
      description: "Cifra discos y particiones con LUKS y los abre o cierra.",
      syntax: "cryptsetup luksFormat dispositivo | open dispositivo nombre | close nombre | luksDump dispositivo",
      requires: "sudo apt install cryptsetup",
      flags: [
        { flag: "luksFormat", description: "Crea el volumen cifrado: destruye los datos." },
        { flag: "open", description: "Lo abre en /dev/mapper/nombre." },
        { flag: "luksAddKey", description: "Añade otra contraseña o archivo de clave." }
      ],
      example: { command: "sudo cryptsetup luksFormat /dev/sdb1 && sudo cryptsetup open /dev/sdb1 datos_cifrados && sudo mkfs.ext4 /dev/mapper/datos_cifrados", explanation: "Prepara un disco cifrado para copias de seguridad. Confirma antes el dispositivo con lsblk y guarda la contraseña: sin ella los datos son irrecuperables." },
      tags: ["cifrado de disco", "luks", "encriptar", "particion cifrada"]
    },
    {
      id: "linux-alias", name: "alias / history", os: "linux", shell: "bash", category: "automation", risk: "safe",
      description: "Crea atajos para comandos largos y recupera lo que ya se ha ejecutado.",
      syntax: "alias nombre='comando' | unalias nombre | history [N] | !N | Ctrl+R",
      flags: [
        { flag: "alias", description: "Sin argumentos, lista los definidos." },
        { flag: "history | grep", description: "Busca en el historial." },
        { flag: "Ctrl+R", description: "Búsqueda interactiva hacia atrás." },
        { flag: "HISTTIMEFORMAT", description: "Añade fecha y hora al historial." }
      ],
      example: { command: "echo \"alias puertos='ss -tulpn'\" >> ~/.bashrc && echo \"export HISTTIMEFORMAT='%F %T '\" >> ~/.bashrc && source ~/.bashrc", explanation: "Define un atajo permanente y hace que el historial guarde cuándo se ejecutó cada orden, útil para reconstruir qué pasó." },
      tags: ["atajos", "historial", "bashrc", "buscar comando"]
    },
    {
      id: "linux-trap", name: "trap", os: "linux", shell: "bash", category: "automation", risk: "safe",
      description: "Ejecuta una acción cuando el script termina o recibe una señal: limpieza garantizada.",
      syntax: "trap 'comandos' EXIT|ERR|INT|TERM",
      flags: [
        { flag: "EXIT", description: "Al terminar, haya ido bien o mal." },
        { flag: "ERR", description: "Cuando un comando falla." },
        { flag: "INT TERM", description: "Al pulsar Ctrl+C o recibir kill." }
      ],
      example: { command: "tmp=$(mktemp -d) && trap 'rm -rf \"$tmp\"' EXIT && tar -xzf /backups/web.tar.gz -C \"$tmp\" && ls \"$tmp\"", explanation: "El directorio temporal se borra siempre, aunque el script falle a mitad o lo interrumpan." },
      tags: ["limpieza", "señales", "script", "temporal", "exit"]
    },
    {
      id: "linux-test", name: "test / [[ ]]", os: "linux", shell: "bash", category: "automation", risk: "safe",
      description: "Evalúa condiciones en scripts: si existe un archivo, si una variable está vacía, comparaciones.",
      syntax: "[[ condición ]] && acción || alternativa | if [[ condición ]]; then ...; fi",
      flags: [
        { flag: "-f / -d / -e", description: "Es archivo / es directorio / existe." },
        { flag: "-z / -n", description: "Cadena vacía / no vacía." },
        { flag: "-eq -gt -lt", description: "Comparaciones numéricas." },
        { flag: "=~", description: "Coincide con una expresión regular." }
      ],
      example: { command: "uso=$(df --output=pcent / | tail -n 1 | tr -dc '0-9'); if [[ \"$uso\" -gt 90 ]]; then echo \"Disco raíz al ${uso}%\" | mail -s \"Alerta srv01\" admin@empresa.com; fi", explanation: "Aviso por correo cuando el disco raíz pasa del 90 %: una comprobación sencilla para cron." },
      tags: ["condicion", "if", "comparar", "script", "existe archivo"]
    },
    {
      id: "linux-case", name: "case", os: "linux", shell: "bash", category: "automation", risk: "safe",
      description: "Elige una acción entre varias según el valor de una variable; más claro que encadenar if.",
      syntax: "case \"$variable\" in patrón1) acción ;; patrón2|patrón3) acción ;; *) por_defecto ;; esac",
      flags: [
        { flag: "a|b)", description: "Varias opciones para la misma acción." },
        { flag: "*.log)", description: "Admite comodines." },
        { flag: "*)", description: "Caso por defecto." }
      ],
      example: { command: "case \"$1\" in start|stop|restart) sudo systemctl \"$1\" apache2 ;; status) systemctl --no-pager status apache2 ;; *) echo \"Uso: $0 {start|stop|restart|status}\"; exit 1 ;; esac", explanation: "Script de control para un servicio que valida el argumento y muestra la ayuda si no es válido." },
      tags: ["opciones", "script", "menu", "argumentos"]
    },
    {
      id: "linux-logger", name: "logger", os: "linux", shell: "bash", category: "automation", risk: "safe",
      description: "Escribe mensajes en el registro del sistema desde un script.",
      syntax: "logger [-t etiqueta] [-p prioridad] [-s] mensaje",
      flags: [
        { flag: "-t etiqueta", description: "Nombre con el que aparece el mensaje." },
        { flag: "-p user.err", description: "Prioridad: info, warning, err…" },
        { flag: "-s", description: "Lo muestra también por pantalla." }
      ],
      example: { command: "logger -t backup -p user.info \"Copia de /srv/datos terminada\" && journalctl -t backup --since today", explanation: "Un script de copias deja constancia en el journal; después se consulta por su etiqueta sin mantener un log propio." },
      tags: ["syslog", "journal", "registrar", "script"]
    },
    {
      id: "linux-ansible-playbook", name: "ansible-playbook", os: "linux", shell: "bash", category: "automation", risk: "caution",
      description: "Aplica un playbook: la configuración deseada de un grupo de servidores, descrita en YAML.",
      syntax: "ansible-playbook -i inventario playbook.yml [--check] [--diff] [-l límite] [-t etiquetas]",
      requires: "sudo apt install ansible",
      flags: [
        { flag: "--check --diff", description: "Simula y muestra qué cambiaría." },
        { flag: "-l web01", description: "Limita la ejecución a algunos equipos." },
        { flag: "-t nginx", description: "Solo las tareas con esa etiqueta." }
      ],
      example: { command: "ansible-playbook -i inventario.ini web.yml --check --diff -l srv01 && ansible-playbook -i inventario.ini web.yml -l srv01", explanation: "Prueba el cambio en un solo servidor: primero en simulación viendo las diferencias y después de verdad." },
      tags: ["ansible", "playbook", "configuracion", "yaml", "idempotente"]
    },
    {
      id: "linux-terraform", name: "terraform plan / apply", os: "linux", shell: "bash", category: "automation", risk: "danger",
      description: "Crea y modifica infraestructura descrita como código: muestra el plan de cambios y lo aplica.",
      syntax: "terraform init | plan [-out archivo] | apply [archivo] | destroy | state list",
      requires: "Terraform u OpenTofu instalado",
      flags: [
        { flag: "init", description: "Descarga los proveedores y prepara el directorio." },
        { flag: "plan -out", description: "Calcula los cambios y los guarda." },
        { flag: "apply plan", description: "Aplica exactamente el plan guardado." },
        { flag: "destroy", description: "Elimina todo lo gestionado." }
      ],
      example: { command: "terraform init && terraform plan -out cambios.tfplan && terraform apply cambios.tfplan", explanation: "Lee el plan antes de aplicar: una línea «must be replaced» significa que el recurso se borra y se crea de nuevo, con pérdida de datos." },
      tags: ["infraestructura como codigo", "iac", "nube", "plan", "opentofu"]
    },
    {
      id: "linux-systemctl-edit", name: "systemctl edit / cat", os: "linux", shell: "bash", category: "automation", risk: "caution",
      description: "Modifica un servicio de systemd sin tocar su archivo original, con un archivo de ajustes que sobrevive a las actualizaciones.",
      syntax: "systemctl cat unidad | systemctl edit unidad | systemctl revert unidad | systemctl daemon-reload",
      flags: [
        { flag: "cat", description: "Muestra la unidad y sus ajustes." },
        { flag: "edit", description: "Abre el archivo de ajustes en un editor." },
        { flag: "revert", description: "Elimina los ajustes locales." }
      ],
      example: { command: "sudo mkdir -p /etc/systemd/system/mariadb.service.d && printf '[Service]\\nLimitNOFILE=65535\\nRestart=on-failure\\n' | sudo tee /etc/systemd/system/mariadb.service.d/limites.conf && sudo systemctl daemon-reload && sudo systemctl restart mariadb", explanation: "Sube el límite de archivos abiertos de MariaDB y hace que se reinicie sola si cae, sin modificar la unidad del paquete." },
      tags: ["systemd", "override", "unidad", "limitnofile", "reinicio automatico"]
    },
    {
      id: "linux-mdadm", name: "mdadm", os: "linux", shell: "bash", category: "storage", risk: "danger",
      description: "Crea y gestiona RAID por software, y muestra su estado.",
      syntax: "cat /proc/mdstat | mdadm --detail /dev/mdN | mdadm --create ... | mdadm --manage /dev/mdN --fail|--remove|--add disco",
      requires: "sudo apt install mdadm",
      flags: [
        { flag: "--detail", description: "Estado del array y de cada disco." },
        { flag: "--fail / --remove", description: "Marca un disco como fallado y lo retira." },
        { flag: "--add", description: "Añade el disco de reemplazo y reconstruye." }
      ],
      example: { command: "cat /proc/mdstat && sudo mdadm --manage /dev/md0 --fail /dev/sdb1 --remove /dev/sdb1 && sudo mdadm --manage /dev/md0 --add /dev/sdc1", explanation: "Sustituye un disco averiado de un RAID 1. Comprueba dos veces cuál es el disco malo: retirar el bueno deja el array sin datos." },
      tags: ["raid", "disco fallado", "reconstruir", "espejo"]
    },
    {
      id: "linux-wipefs", name: "wipefs", os: "linux", shell: "bash", category: "storage", risk: "danger",
      description: "Muestra y borra las firmas de sistemas de archivos, RAID o LVM que quedan en un disco.",
      syntax: "wipefs dispositivo | wipefs -a dispositivo",
      flags: [
        { flag: "(sin opciones)", description: "Lista las firmas sin borrar nada." },
        { flag: "-a", description: "Borra todas las firmas." },
        { flag: "-n", description: "Simula." }
      ],
      example: { command: "sudo wipefs /dev/sdc && sudo wipefs -a /dev/sdc", explanation: "Reutiliza un disco que formó parte de un RAID o de LVM y que el instalador sigue reconociendo como tal. Los datos dejan de ser accesibles." },
      tags: ["firmas", "limpiar disco", "reutilizar", "raid antiguo"]
    },
    {
      id: "linux-fstrim", name: "fstrim", os: "linux", shell: "bash", category: "storage", risk: "caution",
      description: "Informa al SSD o al almacenamiento virtual de los bloques que ya no se usan.",
      syntax: "fstrim [-v] punto_de_montaje | fstrim -av | systemctl status fstrim.timer",
      flags: [
        { flag: "-v", description: "Indica cuánto espacio ha liberado." },
        { flag: "-a", description: "Todos los sistemas de archivos compatibles." },
        { flag: "fstrim.timer", description: "Lo ejecuta cada semana." }
      ],
      example: { command: "sudo fstrim -av && systemctl status fstrim.timer --no-pager | head -n 5", explanation: "En una máquina virtual con disco de aprovisionamiento fino, devuelve al almacenamiento el espacio de los archivos borrados." },
      tags: ["ssd", "trim", "thin provisioning", "liberar espacio"]
    },
    {
      id: "linux-quota", name: "quota / repquota", os: "linux", shell: "bash", category: "storage", risk: "caution",
      description: "Consulta y fija límites de espacio en disco por usuario o grupo.",
      syntax: "quota -u usuario | repquota -a | setquota -u usuario blando duro 0 0 sistema_de_archivos",
      requires: "sudo apt install quota (y montar con usrquota)",
      flags: [
        { flag: "repquota -a", description: "Uso y límites de todos los usuarios." },
        { flag: "setquota", description: "Fija los límites blando y duro (en bloques de 1 K)." },
        { flag: "edquota -t", description: "Periodo de gracia." }
      ],
      example: { command: "sudo setquota -u jlopez 5000000 5500000 0 0 /home && sudo repquota -s /home | head -n 12", explanation: "Limita a un usuario a unos 5 GB en /home para que una carpeta personal no llene el disco de todos." },
      tags: ["cuota", "limite de espacio", "usuario", "home"]
    },
    {
      id: "linux-xfs-repair", name: "xfs_repair / xfs_info", os: "linux", shell: "bash", category: "storage", risk: "danger",
      description: "Repara un sistema de archivos XFS dañado y muestra sus características.",
      syntax: "xfs_info punto_de_montaje | xfs_repair -n dispositivo | xfs_repair dispositivo",
      flags: [
        { flag: "xfs_info", description: "Tamaño de bloque y geometría." },
        { flag: "-n", description: "Solo comprueba, sin modificar." },
        { flag: "-L", description: "Descarta el registro: último recurso, puede perder datos." }
      ],
      example: { command: "sudo umount /datos && sudo xfs_repair -n /dev/vg_datos/lv_datos && sudo xfs_repair /dev/vg_datos/lv_datos && sudo mount /datos", explanation: "El volumen se ha montado en solo lectura por errores: desmóntalo, comprueba y repara. Nunca lo ejecutes sobre un sistema de archivos montado." },
      tags: ["xfs", "reparar", "sistema de archivos dañado", "solo lectura"]
    },
    {
      id: "linux-iotop", name: "iotop", os: "linux", shell: "bash", category: "storage", risk: "safe",
      description: "Muestra en vivo qué procesos están leyendo o escribiendo en disco.",
      syntax: "iotop [-o] [-a] [-P] [-b -n veces]",
      requires: "sudo apt install iotop",
      flags: [
        { flag: "-o", description: "Solo los procesos con actividad." },
        { flag: "-a", description: "Acumulado desde que se lanzó." },
        { flag: "-P", description: "Por proceso, no por hilo." }
      ],
      example: { command: "sudo iotop -o -P -a", explanation: "El servidor va lento y la CPU espera al disco (iowait alto): señala qué proceso está saturando el almacenamiento." },
      tags: ["e/s", "disco lento", "iowait", "escritura", "proceso"]
    },
    {
      id: "linux-exportfs", name: "showmount / exportfs", os: "linux", shell: "bash", category: "storage", risk: "caution",
      description: "Publican carpetas por NFS y muestran qué exporta un servidor.",
      syntax: "showmount -e servidor | exportfs -v | exportfs -ra",
      requires: "Servidor: sudo apt install nfs-kernel-server · Cliente: nfs-common",
      flags: [
        { flag: "showmount -e", description: "Carpetas que exporta un servidor." },
        { flag: "exportfs -v", description: "Exportaciones activas con sus opciones." },
        { flag: "exportfs -ra", description: "Vuelve a leer /etc/exports." }
      ],
      example: { command: "echo \"/srv/compartido 192.168.10.0/24(rw,sync,no_subtree_check)\" | sudo tee -a /etc/exports && sudo exportfs -ra && showmount -e localhost", explanation: "Comparte una carpeta por NFS solo con la red interna y comprueba que el servidor la publica." },
      tags: ["nfs", "compartir carpeta", "exports", "montaje de red"]
    },
    {
      id: "linux-mount-cifs", name: "mount -t cifs", os: "linux", shell: "bash", category: "storage", risk: "caution",
      description: "Monta una carpeta compartida de Windows o Samba en Linux.",
      syntax: "mount -t cifs //servidor/recurso punto_de_montaje -o credentials=archivo,uid=usuario,vers=3.0",
      requires: "sudo apt install cifs-utils",
      flags: [
        { flag: "credentials=archivo", description: "Usuario y contraseña en un archivo protegido." },
        { flag: "uid= / gid=", description: "Propietario local de los archivos." },
        { flag: "vers=3.0", description: "Versión del protocolo SMB." }
      ],
      example: { command: "sudo mkdir -p /mnt/informes && sudo mount -t cifs //srv02/Informes /mnt/informes -o credentials=/root/.smb-informes,uid=www-data,vers=3.0", explanation: "La aplicación web necesita leer documentos de un servidor de archivos Windows. El archivo de credenciales debe tener permisos 600." },
      tags: ["smb", "samba", "carpeta de windows", "recurso compartido"]
    },
    {
      id: "linux-apt-cache", name: "apt-cache / apt list", os: "linux", shell: "bash", category: "packages", risk: "safe",
      description: "Consulta qué versiones hay de un paquete, de qué repositorio vienen y qué está pendiente de actualizar.",
      syntax: "apt-cache policy paquete | apt-cache search texto | apt list --upgradable | apt show paquete",
      flags: [
        { flag: "policy", description: "Versión instalada, candidata y origen." },
        { flag: "search", description: "Busca paquetes por nombre o descripción." },
        { flag: "list --upgradable", description: "Paquetes con actualización disponible." }
      ],
      example: { command: "apt-cache policy nginx && apt list --upgradable 2>/dev/null | grep -i security", explanation: "Comprueba de qué repositorio se instalaría nginx y qué actualizaciones de seguridad hay pendientes." },
      tags: ["version", "repositorio", "pendiente de actualizar", "buscar paquete"]
    },
    {
      id: "linux-update-alternatives", name: "update-alternatives", os: "linux", shell: "bash", category: "packages", risk: "caution",
      description: "Elige qué versión se usa por defecto cuando hay varias instaladas: Java, Python, editor.",
      syntax: "update-alternatives --list nombre | --config nombre | --set nombre ruta",
      flags: [
        { flag: "--list", description: "Alternativas disponibles." },
        { flag: "--config", description: "Elige de forma interactiva." },
        { flag: "--set", description: "Fija una sin preguntar (para scripts)." }
      ],
      example: { command: "update-alternatives --list java && sudo update-alternatives --set java /usr/lib/jvm/java-17-openjdk-amd64/bin/java && java -version", explanation: "Hay dos versiones de Java y la aplicación necesita la 17: la fija como predeterminada para todo el sistema." },
      tags: ["version por defecto", "java", "alternativas", "varias versiones"]
    },
    {
      id: "linux-pip", name: "pip / pipx", os: "linux", shell: "bash", category: "packages", risk: "caution",
      description: "Instala paquetes de Python: pip dentro de un entorno virtual y pipx para herramientas de línea de comandos.",
      syntax: "python3 -m venv ruta && ruta/bin/pip install paquete | pipx install herramienta | pip list --outdated",
      requires: "sudo apt install python3-venv pipx",
      flags: [
        { flag: "python3 -m venv", description: "Crea un entorno aislado." },
        { flag: "pip install -r", description: "Instala desde requirements.txt." },
        { flag: "pipx install", description: "Instala una herramienta en su propio entorno." }
      ],
      example: { command: "python3 -m venv /opt/app/venv && /opt/app/venv/bin/pip install -r /opt/app/requirements.txt && pipx install ansible-lint", explanation: "Instala las dependencias de una aplicación sin tocar el Python del sistema, que en Ubuntu reciente rechaza el «pip install» global." },
      tags: ["python", "entorno virtual", "venv", "dependencias"]
    },
    {
      id: "linux-add-apt-repository", name: "add-apt-repository", os: "linux", shell: "bash", category: "packages", risk: "caution",
      description: "Añade o quita repositorios adicionales, como los PPA de Ubuntu.",
      syntax: "add-apt-repository [-y] ppa:usuario/nombre | add-apt-repository --remove ppa:usuario/nombre",
      requires: "sudo apt install software-properties-common",
      flags: [
        { flag: "ppa:usuario/nombre", description: "Repositorio personal de Launchpad." },
        { flag: "--remove", description: "Lo quita." },
        { flag: "-y", description: "Sin pedir confirmación." }
      ],
      example: { command: "sudo add-apt-repository -y ppa:ondrej/php && sudo apt update && apt-cache policy php8.3", explanation: "Instala una versión de PHP más reciente que la de la distribución. Un repositorio de terceros puede actualizar paquetes del sistema: añade solo los de confianza." },
      tags: ["ppa", "repositorio", "terceros", "version reciente"]
    },
    {
      id: "linux-dpkg-L", name: "dpkg -L / -S", os: "linux", shell: "bash", category: "packages", risk: "safe",
      description: "Averigua qué archivos instaló un paquete y a qué paquete pertenece un archivo.",
      syntax: "dpkg -L paquete | dpkg -S ruta | dpkg -i archivo.deb | dpkg --verify paquete",
      flags: [
        { flag: "-L paquete", description: "Archivos que instaló." },
        { flag: "-S ruta", description: "Paquete dueño de ese archivo." },
        { flag: "--verify", description: "Detecta archivos modificados o que faltan." }
      ],
      example: { command: "dpkg -S /usr/sbin/apache2 && dpkg -L apache2-bin | grep -E \"bin/|\\.service$\"", explanation: "Descubre de qué paquete viene un binario y dónde dejó sus ejecutables y su servicio." },
      tags: ["archivos de un paquete", "a que paquete pertenece", "deb", "verificar"]
    },
    {
      id: "linux-docker-build", name: "docker build", os: "linux", shell: "bash", category: "containers", risk: "caution",
      description: "Construye una imagen a partir de un Dockerfile.",
      syntax: "docker build -t nombre:etiqueta [-f Dockerfile] [--no-cache] [--build-arg CLAVE=valor] contexto",
      flags: [
        { flag: "-t nombre:etiqueta", description: "Nombre y versión de la imagen." },
        { flag: "--no-cache", description: "Reconstruye todas las capas." },
        { flag: "--build-arg", description: "Pasa un valor al Dockerfile." }
      ],
      example: { command: "docker build -t registro.corp.local/intranet:2.4.0 . && docker image ls registro.corp.local/intranet", explanation: "Construye la imagen de una aplicación con su número de versión; evita «latest» para saber siempre qué hay desplegado." },
      tags: ["imagen", "dockerfile", "construir", "etiqueta"]
    },
    {
      id: "linux-docker-network", name: "docker network", os: "linux", shell: "bash", category: "containers", risk: "caution",
      description: "Crea redes para que los contenedores se vean entre sí por nombre y las inspecciona.",
      syntax: "docker network ls | create nombre | inspect nombre | connect red contenedor",
      flags: [
        { flag: "ls", description: "Redes existentes." },
        { flag: "create", description: "Crea una red de tipo bridge con DNS interno." },
        { flag: "inspect", description: "Subred y contenedores conectados." }
      ],
      example: { command: "docker network create backend && docker network connect backend web && docker network inspect backend --format '{{range .Containers}}{{.Name}} {{.IPv4Address}}{{println}}{{end}}'", explanation: "Conecta la web y la base de datos a una red propia: se encuentran por nombre y la base de datos no queda expuesta al exterior." },
      tags: ["red de contenedores", "bridge", "dns interno", "aislar"]
    },
    {
      id: "linux-docker-volume", name: "docker volume", os: "linux", shell: "bash", category: "containers", risk: "caution",
      description: "Gestiona los volúmenes donde los contenedores guardan datos que deben sobrevivir.",
      syntax: "docker volume ls | create nombre | inspect nombre | rm nombre | prune",
      flags: [
        { flag: "ls", description: "Volúmenes existentes." },
        { flag: "inspect", description: "Dónde están los datos en el anfitrión." },
        { flag: "prune", description: "Borra los que ningún contenedor usa." }
      ],
      example: { command: "docker run --rm -v datos_bd:/origen:ro -v /backups:/destino alpine tar -czf /destino/datos_bd-$(date +%F).tar.gz -C /origen .", explanation: "Copia de seguridad de un volumen con un contenedor temporal, sin detener el servicio ni buscar los datos en el anfitrión." },
      tags: ["volumen", "persistencia", "datos", "copia de seguridad"]
    },
    {
      id: "linux-docker-push", name: "docker tag / push / pull", os: "linux", shell: "bash", category: "containers", risk: "caution",
      description: "Etiqueta imágenes y las sube o descarga de un registro.",
      syntax: "docker login registro | docker tag origen destino | docker push imagen | docker pull imagen",
      flags: [
        { flag: "login", description: "Inicia sesión en el registro." },
        { flag: "tag", description: "Da a la imagen el nombre del registro de destino." },
        { flag: "pull imagen@sha256:…", description: "Descarga una versión exacta e inmutable." }
      ],
      example: { command: "docker tag intranet:2.4.0 registro.corp.local/intranet:2.4.0 && docker push registro.corp.local/intranet:2.4.0", explanation: "Publica la imagen en el registro interno para que los servidores de producción puedan descargarla." },
      tags: ["registro", "subir imagen", "etiquetar", "publicar"]
    },
    {
      id: "linux-kubectl-apply", name: "kubectl apply / delete", os: "linux", shell: "bash", category: "containers", risk: "danger",
      description: "Crea, actualiza o elimina recursos de Kubernetes a partir de archivos YAML.",
      syntax: "kubectl apply -f archivo|carpeta [--dry-run=server] | kubectl diff -f archivo | kubectl delete -f archivo",
      flags: [
        { flag: "diff -f", description: "Muestra qué cambiaría." },
        { flag: "--dry-run=server", description: "Valida contra el clúster sin aplicar." },
        { flag: "delete -f", description: "Elimina lo definido en el archivo." }
      ],
      example: { command: "kubectl diff -f despliegue.yaml; kubectl apply -f despliegue.yaml && kubectl rollout status deployment/intranet", explanation: "Revisa las diferencias, aplica el cambio y espera a que el despliegue termine. Comprueba antes el contexto: es fácil aplicar en el clúster equivocado." },
      tags: ["desplegar", "yaml", "manifiesto", "kubernetes"]
    },
    {
      id: "linux-kubectl-config", name: "kubectl config", os: "linux", shell: "bash", category: "containers", risk: "caution",
      description: "Muestra y cambia el clúster y el espacio de nombres sobre los que actúa kubectl.",
      syntax: "kubectl config get-contexts | current-context | use-context nombre | set-context --current --namespace=ns",
      flags: [
        { flag: "get-contexts", description: "Clústeres configurados; el activo lleva un asterisco." },
        { flag: "use-context", description: "Cambia de clúster." },
        { flag: "--namespace", description: "Espacio de nombres por defecto." }
      ],
      example: { command: "kubectl config current-context && kubectl config use-context preproduccion && kubectl config set-context --current --namespace=intranet", explanation: "Antes de cualquier cambio, confirma en qué clúster estás; después pasa a preproducción y fija el espacio de nombres." },
      tags: ["contexto", "cluster", "namespace", "kubeconfig"]
    },
    {
      id: "linux-helm", name: "helm", os: "linux", shell: "bash", category: "containers", risk: "caution",
      description: "Instala y actualiza aplicaciones en Kubernetes empaquetadas como charts, y permite volver a una versión anterior.",
      syntax: "helm list -A | helm upgrade --install nombre chart -f valores.yaml | helm history nombre | helm rollback nombre revisión",
      requires: "Helm instalado y acceso al clúster",
      flags: [
        { flag: "upgrade --install", description: "Instala o actualiza, según exista o no." },
        { flag: "-f valores.yaml", description: "Configuración propia." },
        { flag: "rollback", description: "Vuelve a una revisión anterior." }
      ],
      example: { command: "helm upgrade --install ingress ingress-nginx/ingress-nginx -n ingress --create-namespace -f valores.yaml && helm history ingress -n ingress", explanation: "Despliega el controlador de entrada con la configuración propia y deja el historial listo por si hay que volver atrás." },
      tags: ["charts", "kubernetes", "instalar aplicacion", "rollback"]
    },
    {
      id: "linux-git-cherry-pick", name: "git cherry-pick", os: "linux", shell: "bash", category: "git", risk: "caution",
      description: "Aplica en la rama actual un commit concreto de otra rama.",
      syntax: "git cherry-pick [-x] commit | git cherry-pick --abort",
      flags: [
        { flag: "-x", description: "Anota en el mensaje de qué commit procede." },
        { flag: "--no-commit", description: "Aplica los cambios sin confirmar." },
        { flag: "--abort", description: "Cancela si hay conflictos." }
      ],
      example: { command: "git switch produccion && git cherry-pick -x 4f2a9c1 && git push origin produccion", explanation: "Lleva a producción solo la corrección urgente, sin arrastrar el resto de cambios que hay en la rama principal." },
      tags: ["aplicar commit", "hotfix", "correccion urgente"]
    },
    {
      id: "linux-git-rebase", name: "git rebase", os: "linux", shell: "bash", category: "git", risk: "danger",
      description: "Reescribe la rama colocando sus commits sobre otra base, o los reordena y combina.",
      syntax: "git rebase rama | git rebase -i HEAD~N | git rebase --continue | --abort",
      flags: [
        { flag: "rebase main", description: "Pone tus commits encima de main." },
        { flag: "-i HEAD~3", description: "Edita, combina o reordena los 3 últimos." },
        { flag: "--abort", description: "Vuelve al estado anterior." }
      ],
      example: { command: "git fetch origin && git rebase origin/main && git push --force-with-lease", explanation: "Actualiza tu rama de trabajo con lo último de main. Hazlo solo en ramas propias: reescribir una rama compartida rompe el trabajo de los demás." },
      tags: ["reescribir historial", "actualizar rama", "squash", "force"]
    },
    {
      id: "linux-git-bisect", name: "git bisect", os: "linux", shell: "bash", category: "git", risk: "safe",
      description: "Encuentra por búsqueda binaria el commit que introdujo un fallo.",
      syntax: "git bisect start | bad [commit] | good commit | run comando | reset",
      flags: [
        { flag: "bad / good", description: "Marca la versión como mala o buena." },
        { flag: "run script", description: "Automatiza la prueba con un script." },
        { flag: "reset", description: "Termina y vuelve a donde estabas." }
      ],
      example: { command: "git bisect start && git bisect bad HEAD && git bisect good v2.3.0 && git bisect run ./pruebas.sh; git bisect reset", explanation: "La versión 2.3.0 funcionaba y la actual no: localiza el commit culpable en unos pocos pasos, aunque haya cientos por medio." },
      tags: ["encontrar fallo", "regresion", "busqueda binaria", "depurar"]
    },
    {
      id: "linux-git-reflog", name: "git reflog", os: "linux", shell: "bash", category: "git", risk: "safe",
      description: "Muestra todos los movimientos recientes de HEAD: la red de seguridad para recuperar commits perdidos.",
      syntax: "git reflog [show rama] | git reset --hard HEAD@{N} | git branch nombre HEAD@{N}",
      flags: [
        { flag: "reflog", description: "Historial de posiciones de HEAD." },
        { flag: "HEAD@{2}", description: "Dónde estaba HEAD hace dos movimientos." },
        { flag: "branch nombre HEAD@{N}", description: "Recupera ese estado en una rama nueva." }
      ],
      example: { command: "git reflog -n 10 && git branch rescate HEAD@{2}", explanation: "Tras un «reset --hard» o un rebase que salió mal, encuentra el commit anterior y lo recupera en una rama sin tocar nada más." },
      tags: ["recuperar commit", "deshacer reset", "perdido", "rescate"]
    },
    {
      id: "linux-git-clean", name: "git clean / .gitignore", os: "linux", shell: "bash", category: "git", risk: "danger",
      description: "Borra los archivos que Git no controla; .gitignore indica cuáles no deben subirse nunca.",
      syntax: "git clean -n | git clean -fd [-x] | git check-ignore -v archivo",
      flags: [
        { flag: "-n", description: "Muestra qué borraría." },
        { flag: "-fd", description: "Borra archivos y carpetas sin seguimiento." },
        { flag: "-x", description: "Incluye también lo ignorado." }
      ],
      example: { command: "git clean -n -d && git clean -fd", explanation: "Deja el repositorio limpio antes de una compilación. Lo que borra no pasa por la papelera ni está en Git: mira siempre antes la simulación." },
      tags: ["limpiar", "sin seguimiento", "gitignore", "archivos sobrantes"]
    },
    {
      id: "linux-vagrant", name: "vagrant", os: "linux", shell: "bash", category: "virtualization", risk: "caution",
      description: "Crea y destruye máquinas virtuales de laboratorio a partir de un archivo de configuración.",
      syntax: "vagrant init caja | up | ssh | halt | destroy [-f] | status",
      requires: "Vagrant y un proveedor (VirtualBox, libvirt…)",
      flags: [
        { flag: "up", description: "Crea y arranca la máquina." },
        { flag: "ssh", description: "Entra en ella." },
        { flag: "destroy -f", description: "La elimina por completo." }
      ],
      example: { command: "vagrant init ubuntu/jammy64 && vagrant up && vagrant ssh -c \"lsb_release -ds\"", explanation: "Levanta en minutos un Ubuntu desechable para probar un cambio antes de tocar un servidor real." },
      tags: ["laboratorio", "maquina de pruebas", "virtualbox", "desechable"]
    },
    {
      id: "linux-qemu-img", name: "qemu-img", os: "linux", shell: "bash", category: "virtualization", risk: "caution",
      description: "Crea, convierte, redimensiona e inspecciona imágenes de disco de máquinas virtuales.",
      syntax: "qemu-img info imagen | create -f qcow2 imagen tamaño | convert -O formato origen destino | resize imagen +10G",
      requires: "sudo apt install qemu-utils",
      flags: [
        { flag: "info", description: "Formato, tamaño virtual y espacio real." },
        { flag: "convert -O qcow2", description: "Convierte entre vmdk, vhdx, raw y qcow2." },
        { flag: "resize +10G", description: "Amplía el disco virtual." }
      ],
      example: { command: "qemu-img info servidor.vmdk && qemu-img convert -p -O qcow2 servidor.vmdk servidor.qcow2", explanation: "Migra una máquina de VMware a KVM o Proxmox convirtiendo su disco, con barra de progreso." },
      tags: ["imagen de disco", "convertir", "vmdk", "qcow2", "migrar"]
    },
    {
      id: "linux-virt-install", name: "virt-install", os: "linux", shell: "bash", category: "virtualization", risk: "caution",
      description: "Crea una máquina virtual KVM desde la línea de comandos.",
      syntax: "virt-install --name nombre --memory MB --vcpus N --disk size=GB --cdrom iso --os-variant variante --network bridge=br0",
      requires: "sudo apt install virtinst libvirt-daemon-system",
      flags: [
        { flag: "--memory / --vcpus", description: "Memoria en MB y procesadores." },
        { flag: "--disk size=40", description: "Disco nuevo de 40 GB." },
        { flag: "--os-variant", description: "Ajusta el hardware virtual al sistema invitado." },
        { flag: "--graphics none", description: "Instalación por consola serie." }
      ],
      example: { command: "sudo virt-install --name web02 --memory 4096 --vcpus 2 --disk size=40 --cdrom /var/lib/libvirt/images/ubuntu-24.04-live-server-amd64.iso --os-variant ubuntu24.04 --network bridge=br0", explanation: "Crea un servidor virtual nuevo en el hipervisor sin interfaz gráfica; después se gestiona con virsh." },
      tags: ["kvm", "crear maquina virtual", "libvirt", "hipervisor"]
    },
    {
      id: "win-net-localgroup", name: "net localgroup", os: "windows", shell: "cmd", category: "users", risk: "caution",
      description: "Lista los grupos locales, muestra sus miembros y añade o quita cuentas desde cmd.",
      syntax: "net localgroup [grupo] [cuenta /add | /delete]",
      flags: [
        { flag: "(sin argumentos)", description: "Todos los grupos locales." },
        { flag: "grupo", description: "Miembros de ese grupo." },
        { flag: "cuenta /add", description: "Añade la cuenta al grupo." }
      ],
      example: { command: "net localgroup Administradores && net localgroup Administradores CORP\\jlopez /add", explanation: "Revisa quién es administrador local y añade a un técnico del dominio. Funciona igual en un equipo sin PowerShell moderno." },
      tags: ["grupo local", "administradores", "miembros", "cmd"]
    },
    {
      id: "win-new-localgroup", name: "New-LocalGroup / Get-LocalGroup", os: "windows", shell: "powershell", category: "users", risk: "caution",
      description: "Crea grupos locales y lista los que existen en el equipo.",
      syntax: "Get-LocalGroup [-Name <grupo>] | New-LocalGroup -Name <grupo> [-Description <texto>] | Remove-LocalGroup -Name <grupo>",
      flags: [
        { flag: "Get-LocalGroup", description: "Grupos locales con su descripción." },
        { flag: "New-LocalGroup", description: "Crea un grupo nuevo." },
        { flag: "Remove-LocalGroup", description: "Elimina un grupo." }
      ],
      example: { command: "New-LocalGroup -Name \"Operadores de copia local\" -Description \"Pueden lanzar la copia nocturna\"; Add-LocalGroupMember -Group \"Operadores de copia local\" -Member \"CORP\\aruiz\"", explanation: "Crea un grupo local para delegar una tarea concreta sin dar permisos de administrador." },
      tags: ["grupo local", "crear grupo", "delegar"]
    },
    {
      id: "win-remove-localuser", name: "Remove-LocalUser", os: "windows", shell: "powershell", category: "users", risk: "danger",
      description: "Elimina una cuenta local del equipo.",
      syntax: "Remove-LocalUser -Name <usuario> [-WhatIf]",
      flags: [
        { flag: "-Name", description: "Cuenta que se elimina." },
        { flag: "-WhatIf", description: "Muestra qué haría sin hacerlo." },
        { flag: "Disable-LocalUser", description: "Alternativa reversible: la deshabilita." }
      ],
      example: { command: "Disable-LocalUser -Name soporte_temporal; Remove-LocalUser -Name soporte_temporal -WhatIf", explanation: "Retira una cuenta local que ya no se usa. La carpeta del perfil no se borra y el SID no se recupera: deshabilítala primero unos días." },
      tags: ["borrar usuario", "cuenta local", "eliminar", "baja"]
    },
    {
      id: "win-user-profiles", name: "Perfiles de usuario (Win32_UserProfile)", os: "windows", shell: "powershell", category: "users", risk: "danger",
      description: "Lista los perfiles guardados en el equipo, con su último uso, y elimina los antiguos de forma limpia.",
      syntax: "Get-CimInstance Win32_UserProfile | Where-Object { -not $_.Special } | Remove-CimInstance",
      flags: [
        { flag: "LocalPath", description: "Carpeta del perfil." },
        { flag: "LastUseTime", description: "Última vez que se cargó." },
        { flag: "Remove-CimInstance", description: "Borra carpeta y registro del perfil." }
      ],
      example: { command: "Get-CimInstance Win32_UserProfile | Where-Object { -not $_.Special -and $_.LastUseTime -lt (Get-Date).AddDays(-90) } | Select-Object LocalPath, LastUseTime", explanation: "En un equipo compartido con el disco lleno, localiza los perfiles sin usar en 90 días. Para borrarlos, cambia el Select-Object final por Remove-CimInstance." },
      tags: ["perfiles", "liberar espacio", "equipo compartido", "perfil antiguo"]
    },
    {
      id: "win-dsregcmd", name: "dsregcmd /status", os: "windows", shell: "cmd", category: "users", risk: "safe",
      description: "Muestra si el equipo está unido a Microsoft Entra ID, al dominio o a ambos, y el estado del inicio de sesión único.",
      syntax: "dsregcmd /status | /leave | /debug",
      flags: [
        { flag: "/status", description: "Estado de unión, inquilino y token principal." },
        { flag: "AzureAdJoined / DomainJoined", description: "Tipo de unión del equipo." },
        { flag: "AzureAdPrt", description: "Si hay token de inicio de sesión único." }
      ],
      example: { command: "dsregcmd /status | findstr /i \"AzureAdJoined DomainJoined AzureAdPrt TenantName\"", explanation: "Un usuario no consigue acceso condicional ni inicio de sesión único: comprueba el tipo de unión y si el equipo tiene token." },
      tags: ["entra id", "azure ad", "union hibrida", "sso", "intune"]
    },
    {
      id: "win-dir", name: "dir", os: "windows", shell: "cmd", category: "filesystem", risk: "safe",
      description: "Lista archivos y carpetas en cmd, con filtros por atributo y orden.",
      syntax: "dir [ruta] [/s] [/b] [/a[:atributos]] [/o[:orden]] [/t:campo]",
      flags: [
        { flag: "/s /b", description: "Recursivo, solo rutas completas." },
        { flag: "/a:h", description: "Incluye los ocultos." },
        { flag: "/o:-s", description: "Ordena por tamaño, de mayor a menor." },
        { flag: "/o:-d", description: "Ordena por fecha, lo más reciente primero." }
      ],
      example: { command: "dir C:\\inetpub\\logs /s /b /a:-d /o:-s | more", explanation: "Lista todos los archivos de logs de IIS con su ruta completa, útil para pasarla a otro comando o encontrar los más pesados." },
      tags: ["listar", "archivos", "recursivo", "cmd"]
    },
    {
      id: "win-xcopy", name: "copy / xcopy", os: "windows", shell: "cmd", category: "filesystem", risk: "caution",
      description: "Copian archivos y árboles de carpetas desde cmd. Para copias grandes o repetidas es mejor robocopy.",
      syntax: "copy origen destino [/y] | xcopy origen destino [/e] [/i] [/h] [/y] [/d]",
      flags: [
        { flag: "/e", description: "Incluye subcarpetas, también las vacías." },
        { flag: "/i", description: "Trata el destino como carpeta." },
        { flag: "/d", description: "Solo los archivos más nuevos que los del destino." },
        { flag: "/y", description: "Sobrescribe sin preguntar." }
      ],
      example: { command: "xcopy C:\\inetpub\\wwwroot\\intranet D:\\Backups\\intranet-antes /e /i /h /y", explanation: "Copia rápida de la carpeta de una web antes de desplegar una versión nueva, por si hay que volver atrás." },
      tags: ["copiar", "carpeta", "copia rapida", "cmd"]
    },
    {
      id: "win-del", name: "del / rd", os: "windows", shell: "cmd", category: "filesystem", risk: "danger",
      description: "Borran archivos y carpetas desde cmd, sin pasar por la papelera.",
      syntax: "del [/s] [/q] [/f] archivos | rd [/s] [/q] carpeta",
      flags: [
        { flag: "del /s", description: "También en las subcarpetas." },
        { flag: "del /f", description: "Incluye los de solo lectura." },
        { flag: "rd /s", description: "Borra la carpeta con todo su contenido." },
        { flag: "/q", description: "Sin pedir confirmación." }
      ],
      example: { command: "dir C:\\Temp\\instaladores /s /b && rd /s /q C:\\Temp\\instaladores", explanation: "Borra una carpeta temporal completa. Lista antes su contenido: con /s /q no hay confirmación ni papelera." },
      tags: ["borrar", "eliminar carpeta", "rmdir", "cmd"]
    },
    {
      id: "win-type", name: "type / more", os: "windows", shell: "cmd", category: "filesystem", risk: "safe",
      description: "Muestran el contenido de un archivo de texto en cmd, de golpe o página a página.",
      syntax: "type archivo | more archivo | comando | more",
      flags: [
        { flag: "type", description: "Vuelca el archivo entero." },
        { flag: "more", description: "Pagina: Espacio avanza, Q sale." },
        { flag: "type a b > c", description: "Une varios archivos en uno." }
      ],
      example: { command: "type C:\\Windows\\System32\\drivers\\etc\\hosts | findstr /v \"^#\"", explanation: "Muestra el archivo hosts sin las líneas de comentario, para ver de un vistazo si hay entradas que desvían nombres." },
      tags: ["ver archivo", "contenido", "paginar", "hosts"]
    },
    {
      id: "win-tree", name: "tree", os: "windows", shell: "cmd", category: "filesystem", risk: "safe",
      description: "Dibuja la estructura de carpetas en forma de árbol.",
      syntax: "tree [ruta] [/f] [/a]",
      flags: [
        { flag: "/f", description: "Incluye también los archivos." },
        { flag: "/a", description: "Usa caracteres ASCII (para guardar en un archivo)." }
      ],
      example: { command: "tree D:\\Datos\\Compartido /a > C:\\Temp\\estructura-compartido.txt", explanation: "Documenta la estructura de una carpeta compartida antes de reorganizarla o migrarla." },
      tags: ["arbol", "estructura", "carpetas", "documentar"]
    },
    {
      id: "win-get-itemproperty", name: "Get-ItemProperty / Set-ItemProperty", os: "windows", shell: "powershell", category: "filesystem", risk: "caution",
      description: "Leen y cambian propiedades de archivos y valores del Registro con la misma sintaxis.",
      syntax: "Get-ItemProperty -Path <ruta> [-Name <valor>] | Set-ItemProperty -Path <ruta> -Name <valor> -Value <dato>",
      flags: [
        { flag: "-Path HKLM:\\...", description: "Clave del Registro." },
        { flag: "-Name", description: "Valor concreto." },
        { flag: "-Value", description: "Dato nuevo." }
      ],
      example: { command: "Get-ItemProperty -Path \"HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\" -Name fDenyTSConnections; Set-ItemProperty -Path \"HKLM:\\SYSTEM\\CurrentControlSet\\Control\\Terminal Server\" -Name fDenyTSConnections -Value 0", explanation: "Comprueba si el Escritorio remoto está deshabilitado y lo habilita. Falta abrir además la regla del cortafuegos." },
      tags: ["registro", "propiedades", "escritorio remoto", "hklm"]
    },
    {
      id: "win-split-path", name: "Split-Path / Join-Path / Resolve-Path", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "Construyen y descomponen rutas sin concatenar texto a mano.",
      syntax: "Join-Path <base> <hijo> | Split-Path <ruta> [-Leaf | -Parent] | Resolve-Path <ruta>",
      flags: [
        { flag: "Join-Path", description: "Une trozos poniendo bien las barras." },
        { flag: "Split-Path -Leaf", description: "Solo el nombre del archivo." },
        { flag: "$PSScriptRoot", description: "Carpeta del script en ejecución." }
      ],
      example: { command: "$destino = Join-Path \"D:\\Backups\" (Get-Date -Format yyyy-MM); New-Item -ItemType Directory -Path $destino -Force | Out-Null; Copy-Item (Join-Path $PSScriptRoot \"config.json\") $destino", explanation: "Un script que crea la carpeta del mes y copia un archivo que está junto a él, funcione desde donde funcione." },
      tags: ["rutas", "unir ruta", "script", "psscriptroot"]
    },
    {
      id: "win-format-table", name: "Format-Table / Format-List", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "Deciden cómo se muestra la salida: en tabla o con todas las propiedades en lista.",
      syntax: "<cmdlet> | Format-Table [propiedades] [-AutoSize] [-Wrap] | Format-List [*]",
      flags: [
        { flag: "Format-Table -AutoSize", description: "Ajusta el ancho de las columnas." },
        { flag: "Format-List *", description: "Muestra todas las propiedades." },
        { flag: "-Wrap", description: "No corta el texto largo." }
      ],
      example: { command: "Get-Service Spooler | Format-List *; Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 | Format-Table Name, Id, CPU -AutoSize", explanation: "Descubre todas las propiedades de un servicio y presenta los cinco procesos con más CPU en una tabla limpia. Úsalos al final: su salida ya no se puede filtrar ni exportar." },
      tags: ["formato", "tabla", "lista", "propiedades", "salida"]
    },
    {
      id: "win-group-object", name: "Group-Object", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "Agrupa objetos por una propiedad y cuenta cuántos hay en cada grupo.",
      syntax: "<cmdlet> | Group-Object <propiedad> [-NoElement] | Sort-Object Count -Descending",
      flags: [
        { flag: "-NoElement", description: "Solo el recuento, sin los objetos." },
        { flag: "{ expresión }", description: "Agrupa por un valor calculado." },
        { flag: "Count / Name", description: "Tamaño y clave de cada grupo." }
      ],
      example: { command: "Get-ChildItem D:\\Datos -Recurse -File | Group-Object Extension -NoElement | Sort-Object Count -Descending | Select-Object -First 10", explanation: "Qué tipos de archivo abundan más en un recurso compartido: el primer paso para decidir qué archivar o bloquear." },
      tags: ["agrupar", "contar", "resumen", "estadistica"]
    },
    {
      id: "win-tee-object", name: "Tee-Object", os: "windows", shell: "powershell", category: "filesystem", risk: "caution",
      description: "Guarda la salida en un archivo o variable y a la vez la deja pasar por la canalización.",
      syntax: "<cmdlet> | Tee-Object -FilePath <archivo> [-Append] | Tee-Object -Variable <nombre>",
      flags: [
        { flag: "-FilePath", description: "Archivo donde se guarda." },
        { flag: "-Append", description: "Añade en lugar de sobrescribir." },
        { flag: "-Variable", description: "Guarda en una variable." }
      ],
      example: { command: "robocopy D:\\Datos \\\\srv02\\backup\\Datos /MIR /R:1 /W:1 /NP | Tee-Object -FilePath C:\\Logs\\copia.log -Append", explanation: "Ve el progreso de la copia en pantalla mientras queda registrado en un archivo." },
      tags: ["guardar salida", "log", "tee", "canalizacion"]
    },
    {
      id: "win-set-clipboard", name: "clip / Set-Clipboard", os: "windows", shell: "powershell", category: "filesystem", risk: "safe",
      description: "Copian la salida de un comando al portapapeles y leen lo que hay en él.",
      syntax: "<comando> | clip | <cmdlet> | Set-Clipboard | Get-Clipboard",
      flags: [
        { flag: "| clip", description: "Funciona también en cmd." },
        { flag: "Set-Clipboard", description: "Copia texto u objetos convertidos a texto." },
        { flag: "Get-Clipboard", description: "Devuelve el contenido del portapapeles." }
      ],
      example: { command: "ipconfig /all | clip; Get-Clipboard | Select-String \"IPv4\"", explanation: "Copia la configuración de red para pegarla en un tique de soporte sin seleccionar texto en la consola." },
      tags: ["portapapeles", "copiar salida", "pegar", "tique"]
    },
    {
      id: "win-openfiles", name: "openfiles / Get-SmbOpenFile", os: "windows", shell: "powershell", category: "filesystem", risk: "caution",
      description: "Muestran qué archivos compartidos están abiertos y por quién, y permiten cerrarlos.",
      syntax: "Get-SmbOpenFile [| Where-Object Path -like <patrón>] | Close-SmbOpenFile | openfiles /query /s <servidor>",
      flags: [
        { flag: "Get-SmbOpenFile", description: "Archivos abiertos por SMB con usuario y equipo." },
        { flag: "Close-SmbOpenFile", description: "Cierra el archivo: el usuario puede perder cambios." },
        { flag: "openfiles /query", description: "Equivalente clásico de cmd." }
      ],
      example: { command: "Get-SmbOpenFile | Where-Object Path -like \"*Presupuesto2026.xlsx\" | Select-Object ClientUserName, ClientComputerName, Path", explanation: "«El archivo está en uso y no puedo guardarlo»: averigua quién lo tiene abierto para pedirle que lo cierre." },
      tags: ["archivo en uso", "bloqueado", "smb", "quien lo tiene abierto"]
    },
    {
      id: "win-hostname", name: "hostname", os: "windows", shell: "cmd", category: "network", risk: "safe",
      description: "Muestra el nombre del equipo.",
      syntax: "hostname | $env:COMPUTERNAME | [System.Net.Dns]::GetHostEntry($env:COMPUTERNAME).HostName",
      flags: [
        { flag: "hostname", description: "Nombre corto." },
        { flag: "$env:COMPUTERNAME", description: "Lo mismo, para usar en scripts." },
        { flag: "GetHostEntry", description: "Nombre completo con el dominio." }
      ],
      example: { command: "hostname && powershell -NoProfile -Command \"[System.Net.Dns]::GetHostEntry($env:COMPUTERNAME).HostName\"", explanation: "Confirma en qué servidor estás antes de ejecutar un cambio, sobre todo con varias sesiones remotas abiertas." },
      tags: ["nombre del equipo", "fqdn", "servidor"]
    },
    {
      id: "win-netsh-winsock", name: "netsh winsock reset", os: "windows", shell: "cmd", category: "network", risk: "danger",
      description: "Restablece la pila de red de Windows cuando la conexión falla sin motivo aparente.",
      syntax: "netsh winsock reset | netsh int ip reset | ipconfig /flushdns",
      flags: [
        { flag: "winsock reset", description: "Restaura el catálogo Winsock." },
        { flag: "int ip reset", description: "Restablece TCP/IP: se pierde la IP estática." },
        { flag: "ipconfig /flushdns", description: "Vacía la caché DNS." }
      ],
      example: { command: "ipconfig /all > C:\\Temp\\red-antes.txt && netsh winsock reset && netsh int ip reset && shutdown /r /t 60", explanation: "Último recurso en un equipo sin red tras un antivirus o una VPN mal desinstalados. Guarda antes la configuración: hay que reiniciar y volver a poner la IP fija." },
      tags: ["sin red", "restablecer red", "tcp/ip", "pila de red"]
    },
    {
      id: "win-get-netroute", name: "Get-NetRoute / New-NetRoute", os: "windows", shell: "powershell", category: "network", risk: "caution",
      description: "Muestran la tabla de rutas y añaden o quitan rutas estáticas.",
      syntax: "Get-NetRoute [-AddressFamily IPv4] | New-NetRoute -DestinationPrefix <red> -InterfaceAlias <adaptador> -NextHop <puerta> | Remove-NetRoute",
      flags: [
        { flag: "-DestinationPrefix", description: "Red de destino, por ejemplo 10.20.0.0/16." },
        { flag: "-NextHop", description: "Puerta de enlace para esa red." },
        { flag: "-PolicyStore ActiveStore", description: "Solo hasta el próximo reinicio." }
      ],
      example: { command: "New-NetRoute -DestinationPrefix 10.20.0.0/16 -InterfaceAlias \"Ethernet0\" -NextHop 192.168.10.254; Get-NetRoute -DestinationPrefix 10.20.0.0/16", explanation: "El servidor debe llegar a la red de otra sede por un router distinto de la puerta de enlace: añade la ruta estática y la comprueba." },
      tags: ["ruta estatica", "tabla de rutas", "puerta de enlace", "sede"]
    },
    {
      id: "win-dns-server-record", name: "Get-DnsServerResourceRecord / Add-DnsServerResourceRecordA", os: "windows", shell: "powershell", category: "network", risk: "caution",
      description: "Consultan y crean registros en un servidor DNS de Windows.",
      syntax: "Get-DnsServerResourceRecord -ZoneName <zona> [-Name <nombre>] | Add-DnsServerResourceRecordA -ZoneName <zona> -Name <nombre> -IPv4Address <ip> [-CreatePtr]",
      requires: "Módulo DnsServer (RSAT) o ejecutarlo en el servidor DNS",
      flags: [
        { flag: "-ZoneName", description: "Zona DNS." },
        { flag: "-CreatePtr", description: "Crea también el registro inverso." },
        { flag: "-ComputerName", description: "Servidor DNS remoto." }
      ],
      example: { command: "Add-DnsServerResourceRecordA -ZoneName corp.local -Name intranet -IPv4Address 192.168.10.30 -CreatePtr; Get-DnsServerResourceRecord -ZoneName corp.local -Name intranet", explanation: "Da de alta el nombre de una web interna nueva, con su registro inverso, y comprueba el resultado." },
      tags: ["dns", "registro a", "zona", "alta de nombre"]
    },
    {
      id: "win-dhcp-server", name: "Get-DhcpServerv4Scope / Get-DhcpServerv4Lease", os: "windows", shell: "powershell", category: "network", risk: "safe",
      description: "Muestran los ámbitos de un servidor DHCP de Windows, su ocupación y las concesiones.",
      syntax: "Get-DhcpServerv4Scope | Get-DhcpServerv4ScopeStatistics | Get-DhcpServerv4Lease -ScopeId <red>",
      requires: "Módulo DhcpServer (RSAT) o ejecutarlo en el servidor DHCP",
      flags: [
        { flag: "Get-DhcpServerv4Scope", description: "Ámbitos con su rango y estado." },
        { flag: "ScopeStatistics", description: "Direcciones libres y porcentaje en uso." },
        { flag: "Get-DhcpServerv4Lease", description: "Qué equipo tiene cada IP." }
      ],
      example: { command: "Get-DhcpServerv4ScopeStatistics | Select-Object ScopeId, Free, InUse, PercentageInUse; Get-DhcpServerv4Lease -ScopeId 192.168.10.0 | Where-Object HostName -like \"*jlopez*\"", explanation: "Los equipos nuevos no reciben IP: comprueba si el ámbito se ha quedado sin direcciones y busca la concesión de un equipo concreto." },
      tags: ["dhcp", "ambito", "concesiones", "sin direcciones"]
    },
    {
      id: "win-mstsc", name: "mstsc", os: "windows", shell: "cmd", category: "network", risk: "caution",
      description: "Abre una sesión de Escritorio remoto contra otro equipo.",
      syntax: "mstsc /v:equipo[:puerto] [/admin] [/f] [/w:ancho /h:alto] [/restrictedAdmin]",
      flags: [
        { flag: "/v:equipo", description: "Equipo de destino." },
        { flag: "/admin", description: "Sesión de administración." },
        { flag: "/restrictedAdmin", description: "No deja tus credenciales en el equipo remoto." }
      ],
      example: { command: "mstsc /v:srv02.corp.local /admin /w:1600 /h:900", explanation: "Entra en un servidor en una ventana de tamaño fijo. /admin sirve cuando el servidor de licencias de Escritorio remoto no responde." },
      tags: ["escritorio remoto", "rdp", "conexion remota", "3389"]
    },
    {
      id: "win-get-netconnectionprofile", name: "Get-NetConnectionProfile", os: "windows", shell: "powershell", category: "network", risk: "caution",
      description: "Muestra si cada red está clasificada como pública, privada o de dominio, y permite cambiarlo.",
      syntax: "Get-NetConnectionProfile | Set-NetConnectionProfile -InterfaceAlias <adaptador> -NetworkCategory Private|Public",
      flags: [
        { flag: "NetworkCategory", description: "Public, Private o DomainAuthenticated." },
        { flag: "Set-NetConnectionProfile", description: "Cambia la categoría." },
        { flag: "IPv4Connectivity", description: "Si hay salida a Internet." }
      ],
      example: { command: "Get-NetConnectionProfile | Select-Object InterfaceAlias, Name, NetworkCategory; Set-NetConnectionProfile -InterfaceAlias \"Ethernet0\" -NetworkCategory Private", explanation: "WinRM y el uso compartido no funcionan porque la red figura como pública y el cortafuegos aplica el perfil más estricto." },
      tags: ["red publica", "red privada", "perfil de red", "cortafuegos"]
    },
    {
      id: "win-rasdial", name: "rasdial / Get-VpnConnection", os: "windows", shell: "powershell", category: "network", risk: "caution",
      description: "Conectan y desconectan una VPN ya configurada en Windows, y listan las existentes.",
      syntax: "Get-VpnConnection [-AllUserConnection] | rasdial \"<nombre>\" [usuario contraseña] | rasdial \"<nombre>\" /disconnect",
      flags: [
        { flag: "Get-VpnConnection", description: "VPN configuradas y su estado." },
        { flag: "rasdial \"nombre\"", description: "Conecta con las credenciales guardadas." },
        { flag: "/disconnect", description: "Desconecta." }
      ],
      example: { command: "Get-VpnConnection | Select-Object Name, ServerAddress, ConnectionStatus; rasdial \"VPN Oficina\"", explanation: "Conecta la VPN de la oficina desde un script o una tarea programada, sin abrir el panel de red." },
      tags: ["vpn", "conectar vpn", "teletrabajo", "acceso remoto"]
    },
    {
      id: "win-get-smbsession", name: "Get-SmbSession / Get-SmbConnection", os: "windows", shell: "powershell", category: "network", risk: "safe",
      description: "Muestran quién está conectado a los recursos compartidos del servidor y a qué servidores está conectado este equipo.",
      syntax: "Get-SmbSession | Get-SmbConnection | Close-SmbSession -ClientUserName <usuario>",
      flags: [
        { flag: "Get-SmbSession", description: "En el servidor: clientes conectados." },
        { flag: "Get-SmbConnection", description: "En el cliente: conexiones y versión de SMB." },
        { flag: "Dialect", description: "Versión del protocolo negociada." }
      ],
      example: { command: "Get-SmbSession | Select-Object ClientComputerName, ClientUserName, NumOpens | Sort-Object NumOpens -Descending", explanation: "Antes de reiniciar el servidor de archivos, comprueba cuántos usuarios están conectados y con cuántos archivos abiertos." },
      tags: ["smb", "usuarios conectados", "servidor de archivos", "sesiones"]
    },
    {
      id: "win-net-view", name: "net view / net session", os: "windows", shell: "cmd", category: "network", risk: "safe",
      description: "Listan los recursos que comparte un equipo y las sesiones abiertas contra el propio.",
      syntax: "net view \\\\equipo [/all] | net session | net share",
      flags: [
        { flag: "net view \\\\equipo", description: "Recursos compartidos visibles." },
        { flag: "/all", description: "Incluye los administrativos (C$, ADMIN$)." },
        { flag: "net session", description: "Quién está conectado a este equipo." }
      ],
      example: { command: "net view \\\\srv02 /all", explanation: "Comprueba qué carpetas comparte un servidor y si se llega a él por SMB, sin abrir el explorador." },
      tags: ["recursos compartidos", "carpetas compartidas", "smb", "cmd"]
    },
    {
      id: "win-get-date", name: "Get-Date", os: "windows", shell: "powershell", category: "processes", risk: "safe",
      description: "Devuelve la fecha y la hora, les da formato y hace cálculos con ellas.",
      syntax: "Get-Date [-Format <formato>] | (Get-Date).AddDays(N) | New-TimeSpan -Start <fecha> -End <fecha>",
      flags: [
        { flag: "-Format yyyyMMdd-HHmm", description: "Formato para nombres de archivo." },
        { flag: ".AddDays(-30)", description: "Fecha de hace 30 días." },
        { flag: "-Format s", description: "Formato ISO ordenable." }
      ],
      example: { command: "Get-ChildItem D:\\Backups -File | Where-Object LastWriteTime -lt (Get-Date).AddDays(-30) | Remove-Item -WhatIf", explanation: "Borra las copias de más de 30 días. Con -WhatIf solo muestra lo que eliminaría; quítalo cuando el resultado sea el esperado." },
      tags: ["fecha", "formato", "antiguedad", "retencion"]
    },
    {
      id: "win-typeperf", name: "typeperf", os: "windows", shell: "cmd", category: "processes", risk: "safe",
      description: "Muestra o guarda contadores de rendimiento en tiempo real desde la consola.",
      syntax: "typeperf \"contador\" [-si segundos] [-sc muestras] [-o archivo.csv]",
      flags: [
        { flag: "-si 5", description: "Intervalo entre muestras." },
        { flag: "-sc 12", description: "Número de muestras." },
        { flag: "-o archivo.csv", description: "Guarda en un CSV." }
      ],
      example: { command: "typeperf \"\\Processor(_Total)\\% Processor Time\" \"\\Memory\\Available MBytes\" -si 5 -sc 12 -o C:\\Temp\\rendimiento.csv", explanation: "Recoge un minuto de CPU y memoria libre en un CSV para adjuntarlo a una incidencia. Los nombres de los contadores dependen del idioma de Windows." },
      tags: ["rendimiento", "contadores", "cpu", "memoria", "csv"]
    },
    {
      id: "win-bcdedit", name: "bcdedit", os: "windows", shell: "cmd", category: "processes", risk: "danger",
      description: "Consulta y modifica la configuración de arranque de Windows.",
      syntax: "bcdedit [/enum] | bcdedit /export archivo | bcdedit /set {current} safeboot minimal | bcdedit /deletevalue {current} safeboot",
      flags: [
        { flag: "/enum", description: "Entradas de arranque." },
        { flag: "/export", description: "Copia de seguridad de la configuración." },
        { flag: "/set {current} safeboot minimal", description: "Arranca en modo seguro la próxima vez." }
      ],
      example: { command: "bcdedit /export C:\\Temp\\bcd-copia && bcdedit /set {current} safeboot minimal && shutdown /r /t 0", explanation: "Fuerza el arranque en modo seguro para quitar un controlador problemático. Para volver al arranque normal: bcdedit /deletevalue {current} safeboot." },
      tags: ["arranque", "modo seguro", "boot", "bcd"]
    },
    {
      id: "win-set-timezone", name: "Set-TimeZone / tzutil", os: "windows", shell: "powershell", category: "processes", risk: "caution",
      description: "Consultan y cambian la zona horaria del equipo.",
      syntax: "Get-TimeZone [-ListAvailable] | Set-TimeZone -Id <zona> | tzutil /g | tzutil /s <zona>",
      flags: [
        { flag: "Get-TimeZone", description: "Zona actual." },
        { flag: "-ListAvailable", description: "Zonas disponibles." },
        { flag: "Set-TimeZone -Id", description: "Cambia la zona." }
      ],
      example: { command: "Get-TimeZone; Set-TimeZone -Id \"Romance Standard Time\"", explanation: "Un servidor recién instalado muestra la hora de otro huso: fija el de Madrid. La hora se sincroniza aparte, con w32tm." },
      tags: ["zona horaria", "hora", "husos", "madrid"]
    },
    {
      id: "win-rename-computer", name: "Rename-Computer / Add-Computer", os: "windows", shell: "powershell", category: "processes", risk: "danger",
      description: "Cambian el nombre del equipo y lo unen a un dominio.",
      syntax: "Rename-Computer -NewName <nombre> [-Restart] | Add-Computer -DomainName <dominio> [-OUPath <OU>] [-NewName <nombre>] -Credential <cuenta> -Restart",
      flags: [
        { flag: "-NewName", description: "Nombre nuevo." },
        { flag: "-DomainName", description: "Dominio al que se une." },
        { flag: "-OUPath", description: "Unidad organizativa donde se crea la cuenta." },
        { flag: "-Restart", description: "Reinicia para aplicar." }
      ],
      example: { command: "Add-Computer -DomainName corp.local -NewName PC-VENTAS-07 -OUPath \"OU=Equipos,DC=corp,DC=local\" -Credential CORP\\adm.jlopez -Restart", explanation: "Prepara un equipo nuevo: lo renombra, lo une al dominio en su unidad organizativa y reinicia, todo en un paso." },
      tags: ["unir al dominio", "renombrar equipo", "alta de equipo"]
    },
    {
      id: "win-msc-consoles", name: "Consolas de administración (.msc)", os: "windows", shell: "cmd", category: "processes", risk: "safe",
      description: "Atajos para abrir las consolas de administración desde Ejecutar o la consola, sin buscarlas en los menús.",
      syntax: "nombre.msc [/computer=equipo]",
      flags: [
        { flag: "services.msc / eventvwr.msc", description: "Servicios / Visor de eventos." },
        { flag: "compmgmt.msc / diskmgmt.msc", description: "Administración de equipos / de discos." },
        { flag: "dsa.msc / gpmc.msc / dnsmgmt.msc", description: "Usuarios y equipos de AD / directivas / DNS." },
        { flag: "ncpa.cpl / appwiz.cpl", description: "Conexiones de red / programas instalados." }
      ],
      example: { command: "compmgmt.msc /computer=srv02", explanation: "Abre la administración de equipos apuntando directamente a un servidor remoto: servicios, discos, eventos y carpetas compartidas." },
      tags: ["consolas", "msc", "atajos", "ejecutar", "herramientas administrativas"]
    },
    {
      id: "win-startup-commands", name: "Programas de inicio (Win32_StartupCommand)", os: "windows", shell: "powershell", category: "processes", risk: "safe",
      description: "Lista lo que se ejecuta automáticamente al iniciar sesión.",
      syntax: "Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location, User",
      flags: [
        { flag: "Command", description: "Qué se ejecuta." },
        { flag: "Location", description: "Clave Run del Registro o carpeta de inicio." },
        { flag: "User", description: "A quién afecta." }
      ],
      example: { command: "Get-CimInstance Win32_StartupCommand | Select-Object Name, Command, Location, User | Format-Table -AutoSize -Wrap", explanation: "Un equipo tarda mucho en iniciar sesión, o se sospecha de persistencia de malware: revisa todo lo que arranca solo." },
      tags: ["inicio automatico", "arranque lento", "persistencia", "run"]
    },
    {
      id: "win-secedit", name: "secedit", os: "windows", shell: "cmd", category: "security", risk: "caution",
      description: "Exporta y aplica la directiva de seguridad local: contraseñas, bloqueo, derechos de usuario.",
      syntax: "secedit /export /cfg archivo.inf | secedit /configure /db secedit.sdb /cfg archivo.inf [/areas SECURITYPOLICY]",
      flags: [
        { flag: "/export /cfg", description: "Vuelca la directiva actual a un archivo." },
        { flag: "/configure", description: "Aplica la configuración de un archivo." },
        { flag: "/areas", description: "Limita a una parte de la directiva." }
      ],
      example: { command: "secedit /export /cfg C:\\Temp\\directiva-srv01.inf && findstr /i \"MinimumPasswordLength LockoutBadCount\" C:\\Temp\\directiva-srv01.inf", explanation: "Documenta la directiva de seguridad de un servidor o la compara con otro; el mismo archivo sirve para aplicarla en equipos fuera del dominio." },
      tags: ["directiva local", "politica de seguridad", "exportar", "bastionado"]
    },
    {
      id: "win-set-netfirewallprofile", name: "Set-NetFirewallProfile", os: "windows", shell: "powershell", category: "security", risk: "danger",
      description: "Activa o desactiva el cortafuegos por perfil y define su comportamiento por defecto.",
      syntax: "Set-NetFirewallProfile -Profile Domain,Private,Public -Enabled True|False [-DefaultInboundAction Block] [-LogBlocked True]",
      flags: [
        { flag: "-Enabled True", description: "Activa el cortafuegos en esos perfiles." },
        { flag: "-DefaultInboundAction Block", description: "Bloquea la entrada que no tenga regla." },
        { flag: "-LogBlocked True", description: "Registra las conexiones bloqueadas." }
      ],
      example: { command: "Set-NetFirewallProfile -Profile Domain,Private,Public -Enabled True -DefaultInboundAction Block -LogBlocked True; Get-NetFirewallProfile | Select-Object Name, Enabled, LogFileName", explanation: "Vuelve a activar el cortafuegos que alguien desactivó «para probar» y registra lo bloqueado, para crear reglas en lugar de apagarlo." },
      tags: ["cortafuegos", "activar firewall", "perfiles", "registro"]
    },
    {
      id: "win-netsh-advfirewall", name: "netsh advfirewall", os: "windows", shell: "cmd", category: "security", risk: "caution",
      description: "Gestiona el cortafuegos de Windows desde cmd: estado, reglas y copia de la configuración.",
      syntax: "netsh advfirewall show allprofiles | export archivo.wfw | firewall add rule name=... dir=in action=allow protocol=TCP localport=N",
      flags: [
        { flag: "show allprofiles", description: "Estado de los tres perfiles." },
        { flag: "export / import", description: "Guarda o restaura todas las reglas." },
        { flag: "firewall add rule", description: "Crea una regla." }
      ],
      example: { command: "netsh advfirewall export C:\\Temp\\firewall-srv01.wfw && netsh advfirewall firewall add rule name=\"Intranet 8080\" dir=in action=allow protocol=TCP localport=8080 remoteip=192.168.10.0/24", explanation: "Guarda una copia de las reglas y abre un puerto solo para la red interna, desde un script .bat." },
      tags: ["cortafuegos", "abrir puerto", "reglas", "exportar", "cmd"]
    },
    {
      id: "win-certutil-store", name: "certutil -store / -verify", os: "windows", shell: "cmd", category: "security", risk: "safe",
      description: "Lista los certificados de un almacén y comprueba la cadena y la revocación de uno.",
      syntax: "certutil -store [My|Root|CA] | certutil -verify -urlfetch archivo.cer | certutil -dump archivo",
      flags: [
        { flag: "-store My", description: "Certificados personales del equipo." },
        { flag: "-verify -urlfetch", description: "Valida la cadena descargando CRL y OCSP." },
        { flag: "-dump", description: "Muestra el contenido de un certificado o PFX." }
      ],
      example: { command: "certutil -store My | findstr /i \"Sujeto Subject NotAfter\" && certutil -verify -urlfetch C:\\Temp\\intranet.cer", explanation: "Un servicio rechaza un certificado: revisa los instalados y comprueba si la cadena es de confianza y si la revocación es accesible." },
      tags: ["certificados", "almacen", "cadena", "revocacion", "crl"]
    },
    {
      id: "win-new-selfsignedcertificate", name: "New-SelfSignedCertificate", os: "windows", shell: "powershell", category: "security", risk: "caution",
      description: "Crea un certificado autofirmado para pruebas, servicios internos o firma de scripts.",
      syntax: "New-SelfSignedCertificate -DnsName <nombres> -CertStoreLocation Cert:\\LocalMachine\\My [-NotAfter <fecha>] [-Type CodeSigningCert]",
      flags: [
        { flag: "-DnsName", description: "Nombres que cubre el certificado." },
        { flag: "-NotAfter", description: "Fecha de caducidad." },
        { flag: "-Type CodeSigningCert", description: "Para firmar scripts." }
      ],
      example: { command: "New-SelfSignedCertificate -DnsName intranet.corp.local, intranet -CertStoreLocation Cert:\\LocalMachine\\My -NotAfter (Get-Date).AddYears(2)", explanation: "Certificado para la web interna de pruebas. En producción usa uno de la autoridad de la empresa: los navegadores no confían en uno autofirmado." },
      tags: ["certificado autofirmado", "https", "pruebas", "tls"]
    },
    {
      id: "win-set-mppreference", name: "Set-MpPreference / Add-MpPreference", os: "windows", shell: "powershell", category: "security", risk: "caution",
      description: "Configuran Microsoft Defender: exclusiones, análisis programados y protección en tiempo real.",
      syntax: "Get-MpPreference | Add-MpPreference -ExclusionPath <ruta> | Remove-MpPreference -ExclusionPath <ruta> | Set-MpPreference -<opción> <valor>",
      flags: [
        { flag: "-ExclusionPath", description: "Carpeta que no se analiza." },
        { flag: "-ExclusionProcess", description: "Proceso cuyos archivos no se analizan." },
        { flag: "Get-MpPreference", description: "Configuración y exclusiones actuales." }
      ],
      example: { command: "Add-MpPreference -ExclusionPath \"D:\\SQLData\"; (Get-MpPreference).ExclusionPath", explanation: "Excluye la carpeta de datos de SQL Server, como recomienda el fabricante. Revisa la lista de vez en cuando: una exclusión de más es justo lo que busca el malware." },
      tags: ["defender", "exclusiones", "antivirus", "rendimiento"]
    },
    {
      id: "win-account-changes", name: "Get-WinEvent (cambios en cuentas y grupos)", os: "windows", shell: "powershell", category: "security", risk: "safe",
      description: "Extrae del registro de seguridad quién creó o borró cuentas y quién cambió la pertenencia a grupos.",
      syntax: "Get-WinEvent -FilterHashtable @{ LogName = \"Security\"; Id = <ids>; StartTime = <fecha> }",
      flags: [
        { flag: "4720 / 4726", description: "Cuenta creada / eliminada." },
        { flag: "4728 / 4732", description: "Miembro añadido a un grupo global / local." },
        { flag: "4724", description: "Contraseña restablecida por otro usuario." }
      ],
      example: { command: "Get-WinEvent -FilterHashtable @{ LogName = \"Security\"; Id = 4720, 4726, 4728, 4732; StartTime = (Get-Date).AddDays(-7) } | Select-Object TimeCreated, Id, @{ n = \"Resumen\"; e = { ($_.Message -split \"`n\")[0] } }", explanation: "Revisión semanal en el controlador de dominio: altas, bajas y cambios en grupos privilegiados que nadie esperaba." },
      tags: ["auditoria", "4720", "4728", "cambios en grupos", "altas"]
    },
    {
      id: "win-profile", name: "$PROFILE", os: "windows", shell: "powershell", category: "automation", risk: "safe",
      description: "Script que PowerShell ejecuta al abrirse: el sitio para tus alias, funciones y módulos habituales.",
      syntax: "$PROFILE | Test-Path $PROFILE | New-Item -ItemType File -Path $PROFILE -Force | notepad $PROFILE",
      flags: [
        { flag: "$PROFILE", description: "Ruta del perfil del usuario actual." },
        { flag: "$PROFILE.AllUsersAllHosts", description: "Perfil común a todos los usuarios." },
        { flag: ". $PROFILE", description: "Recarga el perfil sin cerrar la consola." }
      ],
      example: { command: "if (-not (Test-Path $PROFILE)) { New-Item -ItemType File -Path $PROFILE -Force | Out-Null }; Add-Content $PROFILE \"function puertos { Get-NetTCPConnection -State Listen | Sort-Object LocalPort }\"; . $PROFILE", explanation: "Crea el perfil si no existe y añade una función propia que estará disponible en cada consola nueva." },
      tags: ["perfil", "alias", "funciones propias", "personalizar"]
    },
    {
      id: "win-functions", name: "function / param()", os: "windows", shell: "powershell", category: "automation", risk: "safe",
      description: "Definen funciones y scripts con parámetros con nombre, tipo y validación.",
      syntax: "function Nombre { param([Parameter(Mandatory)][tipo]$Param, [tipo]$Otro = valor) ... }",
      flags: [
        { flag: "[Parameter(Mandatory)]", description: "Obliga a indicar el parámetro." },
        { flag: "[ValidateSet(...)]", description: "Limita los valores admitidos." },
        { flag: "[switch]", description: "Parámetro de sí o no." },
        { flag: "[CmdletBinding()]", description: "Añade -Verbose y -ErrorAction." }
      ],
      example: { command: "function Get-EspacioLibre { param([Parameter(Mandatory)][string[]]$Equipo, [int]$MinimoGB = 10) Get-CimInstance Win32_LogicalDisk -ComputerName $Equipo -Filter \"DriveType=3\" | Where-Object { $_.FreeSpace / 1GB -lt $MinimoGB } | Select-Object PSComputerName, DeviceID, @{ n = \"LibreGB\"; e = { [math]::Round($_.FreeSpace / 1GB, 1) } } }; Get-EspacioLibre -Equipo srv01, srv02", explanation: "Convierte una consulta habitual en una orden propia: discos con menos espacio libre del indicado en varios servidores." },
      tags: ["funcion", "parametros", "script", "reutilizar"]
    },
    {
      id: "win-if-switch", name: "if / switch", os: "windows", shell: "powershell", category: "automation", risk: "safe",
      description: "Toman decisiones en un script según una condición o el valor de una variable.",
      syntax: "if (<condición>) { ... } elseif (...) { ... } else { ... } | switch (<valor>) { <caso> { ... } default { ... } }",
      flags: [
        { flag: "-eq -ne -gt -lt", description: "Comparaciones." },
        { flag: "-like / -match", description: "Comodines / expresión regular." },
        { flag: "-and -or -not", description: "Combinan condiciones." },
        { flag: "switch -Wildcard", description: "Casos con comodines." }
      ],
      example: { command: "$s = Get-Service Spooler; switch ($s.Status) { \"Running\" { \"Spooler en marcha\" } \"Stopped\" { Start-Service Spooler; \"Spooler iniciado\" } default { \"Estado inesperado: $($s.Status)\" } }", explanation: "Comprueba un servicio y lo arranca si está parado: el esqueleto de cualquier script de vigilancia." },
      tags: ["condicion", "comparar", "script", "decision"]
    },
    {
      id: "win-foreach", name: "foreach / while", os: "windows", shell: "powershell", category: "automation", risk: "safe",
      description: "Repiten un bloque por cada elemento de una lista o mientras se cumpla una condición.",
      syntax: "foreach ($x in <colección>) { ... } | while (<condición>) { ... } | <colección> | ForEach-Object { $_ }",
      flags: [
        { flag: "foreach", description: "Recorre una colección ya cargada." },
        { flag: "while", description: "Repite mientras la condición sea cierta." },
        { flag: "break / continue", description: "Sale del bucle / pasa al siguiente." }
      ],
      example: { command: "foreach ($equipo in \"srv01\", \"srv02\") { if (Test-Connection $equipo -Count 1 -Quiet) { \"$equipo responde\" } else { \"$equipo NO responde\" } }", explanation: "Recorre una lista de servidores y dice cuáles responden. Sustituye la lista por Get-Content servidores.txt para revisar decenas." },
      tags: ["bucle", "recorrer lista", "repetir", "script"]
    },
    {
      id: "win-whatif", name: "-WhatIf / -Confirm", os: "windows", shell: "powershell", category: "automation", risk: "safe",
      description: "Simulan una orden o piden confirmación antes de cada cambio: la red de seguridad de PowerShell.",
      syntax: "<cmdlet> -WhatIf | <cmdlet> -Confirm | <cmdlet> -Confirm:$false | $WhatIfPreference = $true",
      flags: [
        { flag: "-WhatIf", description: "Muestra qué haría, sin hacerlo." },
        { flag: "-Confirm", description: "Pregunta antes de cada elemento." },
        { flag: "-Confirm:$false", description: "Suprime la pregunta en un script." }
      ],
      example: { command: "Get-ADUser -Filter 'Enabled -eq $false' -SearchBase \"OU=Bajas,DC=corp,DC=local\" | Remove-ADUser -WhatIf", explanation: "Antes de un borrado masivo, comprueba exactamente qué cuentas se eliminarían. No todas las órdenes lo admiten: los programas externos lo ignoran." },
      tags: ["simular", "confirmar", "seguridad", "prueba en seco"]
    },
    {
      id: "win-splatting", name: "Splatting (@parametros)", os: "windows", shell: "powershell", category: "automation", risk: "safe",
      description: "Pasa los parámetros de una orden desde una tabla, en lugar de una línea interminable.",
      syntax: "$p = @{ Parametro = valor; Otro = valor }; <cmdlet> @p",
      flags: [
        { flag: "@{ ... }", description: "Tabla con nombre y valor de cada parámetro." },
        { flag: "@p", description: "Aplica la tabla a la orden (con @, no con $)." },
        { flag: "Interruptor = $true", description: "Así se indican los parámetros de tipo switch." }
      ],
      example: { command: "$p = @{ Name = \"Ana Ruiz\"; SamAccountName = \"aruiz\"; UserPrincipalName = \"aruiz@corp.local\"; Path = \"OU=Usuarios,DC=corp,DC=local\"; Department = \"Contabilidad\"; Enabled = $true; AccountPassword = (Read-Host \"Contraseña\" -AsSecureString) }; New-ADUser @p", explanation: "Un alta de usuario con muchos parámetros se lee y se revisa mejor así, y la misma tabla se reutiliza en otras órdenes." },
      tags: ["parametros", "legibilidad", "tabla hash", "script"]
    },
    {
      id: "win-read-host", name: "Read-Host", os: "windows", shell: "powershell", category: "automation", risk: "safe",
      description: "Pide un dato al usuario en mitad de un script, también de forma oculta para contraseñas.",
      syntax: "$v = Read-Host \"<pregunta>\" | Read-Host \"<pregunta>\" -AsSecureString",
      flags: [
        { flag: "\"pregunta\"", description: "Texto que se muestra." },
        { flag: "-AsSecureString", description: "Oculta lo escrito y lo guarda protegido." },
        { flag: "-MaskInput", description: "Oculta lo escrito pero devuelve texto (PowerShell 7)." }
      ],
      example: { command: "$usuario = Read-Host \"Usuario que hay que desbloquear\"; if ((Read-Host \"¿Desbloquear $usuario? (s/n)\") -eq \"s\") { Unlock-ADAccount -Identity $usuario }", explanation: "Script para el equipo de soporte que pregunta el usuario y pide confirmación antes de actuar." },
      tags: ["preguntar", "entrada", "confirmacion", "contraseña oculta"]
    },
    {
      id: "win-start-bitstransfer", name: "Start-BitsTransfer", os: "windows", shell: "powershell", category: "automation", risk: "safe",
      description: "Descarga o sube archivos grandes con reanudación automática y sin saturar la red.",
      syntax: "Start-BitsTransfer -Source <url|ruta> -Destination <ruta> [-Asynchronous] [-Priority Low] | Get-BitsTransfer",
      flags: [
        { flag: "-Asynchronous", description: "En segundo plano; sobrevive a un reinicio." },
        { flag: "-Priority Low", description: "Usa solo el ancho de banda libre." },
        { flag: "Get-BitsTransfer", description: "Estado de las transferencias." }
      ],
      example: { command: "Start-BitsTransfer -Source https://empresa.com/descargas/imagen-servidor.iso -Destination D:\\ISO\\ -Priority Low -Asynchronous; Get-BitsTransfer | Select-Object DisplayName, JobState, BytesTransferred", explanation: "Descarga una ISO de varios gigas en horario laboral sin molestar a nadie; si se corta la conexión, continúa donde iba." },
      tags: ["descargar", "archivo grande", "reanudar", "segundo plano"]
    },
    {
      id: "win-for-f", name: "for /f (cmd)", os: "windows", shell: "cmd", category: "automation", risk: "caution",
      description: "Recorre en un .bat las líneas de un archivo o la salida de un comando.",
      syntax: "for /f \"tokens=1,2 delims=,\" %%a in (archivo.txt) do comando %%a %%b",
      flags: [
        { flag: "tokens=1,2", description: "Campos de cada línea que se usan." },
        { flag: "delims=,", description: "Separador de campos." },
        { flag: "in ('comando')", description: "Recorre la salida de un comando." },
        { flag: "%%a / %a", description: "Dos signos en un .bat, uno en la consola." }
      ],
      example: { command: "for /f \"tokens=*\" %a in (C:\\Temp\\equipos.txt) do @ping -n 1 -w 500 %a >nul && echo %a responde || echo %a NO responde", explanation: "Comprueba una lista de equipos desde cmd, uno por línea. Dentro de un archivo .bat hay que escribir %%a." },
      tags: ["bucle", "bat", "lote", "recorrer archivo", "cmd"]
    },
    {
      id: "win-get-partition", name: "Get-Partition", os: "windows", shell: "powershell", category: "storage", risk: "safe",
      description: "Lista las particiones de cada disco con su tamaño, tipo y letra.",
      syntax: "Get-Partition [-DiskNumber N] [-DriveLetter L] | Get-PartitionSupportedSize -DriveLetter L",
      flags: [
        { flag: "-DiskNumber", description: "Solo las de ese disco." },
        { flag: "Type", description: "System, Reserved, Recovery o Basic." },
        { flag: "Get-PartitionSupportedSize", description: "Cuánto puede crecer o encogerse." }
      ],
      example: { command: "Get-Partition | Select-Object DiskNumber, PartitionNumber, DriveLetter, Type, @{ n = \"GB\"; e = { [math]::Round($_.Size / 1GB, 1) } }", explanation: "Antes de ampliar C:, comprueba si hay una partición de recuperación justo detrás que lo impida." },
      tags: ["particiones", "disco", "letra de unidad", "recuperacion"]
    },
    {
      id: "win-diskpart-list", name: "diskpart (list / assign)", os: "windows", shell: "cmd", category: "storage", risk: "caution",
      description: "Consulta discos y volúmenes y cambia letras de unidad desde la consola de diskpart.",
      syntax: "diskpart → list disk | list volume | select volume N | assign letter=X | remove letter=X | exit",
      flags: [
        { flag: "list disk / list volume", description: "Discos y volúmenes (solo lectura)." },
        { flag: "select volume N", description: "Elige sobre qué se actúa." },
        { flag: "assign letter=X", description: "Asigna una letra." },
        { flag: "/s guion.txt", description: "Ejecuta las órdenes de un archivo." }
      ],
      example: { command: "(echo list volume & echo select volume 3 & echo assign letter=E) > C:\\Temp\\dp.txt && diskpart /s C:\\Temp\\dp.txt", explanation: "Un disco nuevo aparece sin letra: lista los volúmenes y le asigna la E. Comprueba el número de volumen antes de ejecutarlo." },
      tags: ["letra de unidad", "volumen", "disco sin letra", "diskpart"]
    },
    {
      id: "win-mount-diskimage", name: "Mount-DiskImage", os: "windows", shell: "powershell", category: "storage", risk: "safe",
      description: "Monta y desmonta imágenes ISO y discos virtuales VHD o VHDX como unidades.",
      syntax: "Mount-DiskImage -ImagePath <archivo> [-PassThru] | Dismount-DiskImage -ImagePath <archivo>",
      flags: [
        { flag: "-ImagePath", description: "Ruta completa de la ISO o el VHDX." },
        { flag: "-PassThru | Get-Volume", description: "Devuelve la letra asignada." },
        { flag: "Dismount-DiskImage", description: "Lo desmonta." }
      ],
      example: { command: "$letra = (Mount-DiskImage -ImagePath D:\\ISO\\SQLServer2022.iso -PassThru | Get-Volume).DriveLetter; & \"${letra}:\\setup.exe\" /?", explanation: "Monta una ISO de instalación y averigua su letra, para lanzar el instalador desde un script sin intervención." },
      tags: ["iso", "montar imagen", "vhdx", "instalador"]
    },
    {
      id: "win-smbshareaccess", name: "Get-SmbShareAccess / Grant-SmbShareAccess", os: "windows", shell: "powershell", category: "storage", risk: "caution",
      description: "Consultan y cambian los permisos de un recurso compartido, que se suman a los de NTFS.",
      syntax: "Get-SmbShareAccess -Name <recurso> | Grant-SmbShareAccess -Name <recurso> -AccountName <cuenta> -AccessRight Read|Change|Full -Force | Revoke-SmbShareAccess",
      flags: [
        { flag: "Get-SmbShareAccess", description: "Quién tiene acceso y de qué tipo." },
        { flag: "-AccessRight", description: "Read, Change o Full." },
        { flag: "Revoke-SmbShareAccess", description: "Quita el permiso." }
      ],
      example: { command: "Get-SmbShareAccess -Name Informes; Grant-SmbShareAccess -Name Informes -AccountName \"CORP\\GG_Contabilidad\" -AccessRight Change -Force; Revoke-SmbShareAccess -Name Informes -AccountName Todos -Force", explanation: "Sustituye el permiso genérico «Todos» por el grupo del departamento. Lo que cuenta al final es lo más restrictivo entre el recurso y NTFS." },
      tags: ["permisos de recurso compartido", "smb", "todos", "carpeta compartida"]
    },
    {
      id: "win-clear-recyclebin", name: "Clear-RecycleBin / cleanmgr", os: "windows", shell: "powershell", category: "storage", risk: "caution",
      description: "Vacían la papelera y lanzan el liberador de espacio de Windows.",
      syntax: "Clear-RecycleBin [-DriveLetter L] -Force | cleanmgr /sageset:1 | cleanmgr /sagerun:1 | DISM /Online /Cleanup-Image /StartComponentCleanup",
      flags: [
        { flag: "Clear-RecycleBin -Force", description: "Vacía la papelera sin preguntar." },
        { flag: "cleanmgr /sageset:1", description: "Guarda qué se limpia." },
        { flag: "cleanmgr /sagerun:1", description: "Ejecuta esa limpieza sin preguntar." },
        { flag: "StartComponentCleanup", description: "Elimina versiones antiguas de actualizaciones." }
      ],
      example: { command: "Clear-RecycleBin -DriveLetter C -Force; DISM /Online /Cleanup-Image /StartComponentCleanup; Get-PSDrive C | Select-Object Used, Free", explanation: "El disco C: de un servidor está casi lleno: vacía la papelera y elimina los restos de actualizaciones, que suelen ocupar varios gigas." },
      tags: ["liberar espacio", "papelera", "disco lleno", "limpieza"]
    },
    {
      id: "win-dism-features", name: "DISM /Online (características)", os: "windows", shell: "cmd", category: "packages", risk: "caution",
      description: "Lista, activa y desactiva características opcionales de Windows.",
      syntax: "DISM /Online /Get-Features /Format:Table | /Enable-Feature /FeatureName:<nombre> [/All] [/NoRestart] | /Disable-Feature /FeatureName:<nombre>",
      flags: [
        { flag: "/Get-Features", description: "Características y su estado." },
        { flag: "/Enable-Feature /All", description: "Activa una con sus dependencias." },
        { flag: "/NoRestart", description: "No reinicia al terminar." }
      ],
      example: { command: "DISM /Online /Get-Features /Format:Table | findstr /i \"TelnetClient SMB1\" && DISM /Online /Disable-Feature /FeatureName:SMB1Protocol /NoRestart", explanation: "Comprueba si el antiguo SMB1 sigue activo y lo desactiva: es inseguro y la vía de entrada de varios ransomware." },
      tags: ["caracteristicas", "smb1", "activar funcion", "dism"]
    },
    {
      id: "win-add-windowscapability", name: "Add-WindowsCapability (RSAT)", os: "windows", shell: "powershell", category: "packages", risk: "caution",
      description: "Instala capacidades opcionales de Windows 10 y 11, como las herramientas de administración remota (RSAT) o OpenSSH.",
      syntax: "Get-WindowsCapability -Online -Name <patrón> | Add-WindowsCapability -Online -Name <nombre> | Remove-WindowsCapability -Online -Name <nombre>",
      flags: [
        { flag: "Get-WindowsCapability -Name Rsat*", description: "Herramientas disponibles y su estado." },
        { flag: "Add-WindowsCapability", description: "Instala la capacidad." },
        { flag: "-Online", description: "Actúa sobre el Windows en ejecución." }
      ],
      example: { command: "Get-WindowsCapability -Online -Name \"Rsat.ActiveDirectory*\" | Add-WindowsCapability -Online; Get-Module -ListAvailable ActiveDirectory", explanation: "Instala en tu puesto las herramientas de Active Directory para administrar el dominio sin entrar en el controlador." },
      tags: ["rsat", "herramientas de administracion", "openssh", "capacidades"]
    },
    {
      id: "win-wusa", name: "wusa", os: "windows", shell: "cmd", category: "packages", risk: "caution",
      description: "Instala o desinstala a mano una actualización de Windows descargada (.msu).",
      syntax: "wusa archivo.msu [/quiet] [/norestart] | wusa /uninstall /kb:NNNNNNN [/quiet] [/norestart]",
      flags: [
        { flag: "/quiet /norestart", description: "Sin ventanas y sin reiniciar." },
        { flag: "/uninstall /kb:", description: "Desinstala una actualización por su número." },
        { flag: "/log:archivo", description: "Guarda el registro." }
      ],
      example: { command: "wusa /uninstall /kb:5044281 /quiet /norestart && shutdown /r /t 300 /c \"Reinicio tras quitar KB5044281\"", explanation: "Una actualización ha roto una aplicación: la desinstala y programa el reinicio con aviso. Ocúltala después para que no vuelva a instalarse." },
      tags: ["desinstalar actualizacion", "kb", "msu", "parche problematico"]
    },
    {
      id: "win-get-package", name: "Get-Package / Uninstall-Package", os: "windows", shell: "powershell", category: "packages", risk: "caution",
      description: "Lista el software instalado que reconoce PowerShell y lo desinstala.",
      syntax: "Get-Package [-Name <patrón>] [-ProviderName msi,Programs] | Uninstall-Package [-WhatIf]",
      flags: [
        { flag: "-Name \"*java*\"", description: "Filtra por nombre." },
        { flag: "-ProviderName msi", description: "Solo los instalados con MSI." },
        { flag: "Uninstall-Package", description: "Desinstala (los MSI, de forma silenciosa)." }
      ],
      example: { command: "Get-Package -Name \"*Java*\" -ProviderName msi | Select-Object Name, Version; Get-Package -Name \"*Java 8*\" -ProviderName msi | Uninstall-Package -WhatIf", explanation: "Localiza versiones antiguas de Java y simula su desinstalación. Funciona en Windows PowerShell 5.1; en PowerShell 7 usa winget." },
      tags: ["desinstalar programa", "software instalado", "msi", "java"]
    },
    {
      id: "win-new-adgroup", name: "New-ADGroup / Get-ADGroup", os: "windows", shell: "powershell", category: "ad", risk: "caution",
      description: "Crean grupos de Active Directory y consultan los existentes.",
      syntax: "New-ADGroup -Name <nombre> -GroupScope Global|DomainLocal|Universal -GroupCategory Security -Path <OU> | Get-ADGroup -Filter <filtro>",
      requires: "Módulo ActiveDirectory (RSAT)",
      flags: [
        { flag: "-GroupScope Global", description: "Agrupa usuarios del mismo dominio." },
        { flag: "-GroupScope DomainLocal", description: "Para asignar permisos a recursos." },
        { flag: "-GroupCategory Security", description: "Sirve para permisos (no solo para correo)." }
      ],
      example: { command: "New-ADGroup -Name GG_Contabilidad -GroupScope Global -GroupCategory Security -Path \"OU=Grupos,DC=corp,DC=local\" -Description \"Personal de Contabilidad\"; Get-ADGroup -Filter 'Name -like \"GG_*\"' | Select-Object Name", explanation: "Crea el grupo del departamento con un prefijo que indica su tipo y lista los grupos globales que ya existen." },
      tags: ["crear grupo", "grupo de seguridad", "ambito", "nomenclatura"]
    },
    {
      id: "win-remove-adgroupmember", name: "Remove-ADGroupMember", os: "windows", shell: "powershell", category: "ad", risk: "caution",
      description: "Quita usuarios de un grupo de Active Directory.",
      syntax: "Remove-ADGroupMember -Identity <grupo> -Members <usuarios> [-Confirm:$false]",
      requires: "Módulo ActiveDirectory (RSAT)",
      flags: [
        { flag: "-Identity", description: "Grupo del que se quitan." },
        { flag: "-Members", description: "Uno o varios usuarios." },
        { flag: "-Confirm:$false", description: "Sin preguntar, para scripts." }
      ],
      example: { command: "Get-ADPrincipalGroupMembership jlopez | Where-Object Name -ne \"Domain Users\" | ForEach-Object { Remove-ADGroupMember -Identity $_ -Members jlopez -Confirm:$false }", explanation: "Baja de un empleado: lo saca de todos sus grupos salvo el principal para que pierda los accesos de inmediato. Anota antes la lista por si hay que revertir." },
      tags: ["quitar de grupo", "baja de empleado", "revocar acceso"]
    },
    {
      id: "win-get-addomain", name: "Get-ADDomain / Get-ADForest", os: "windows", shell: "powershell", category: "ad", risk: "safe",
      description: "Muestran los datos del dominio y del bosque: nivel funcional, controladores y maestros de operaciones.",
      syntax: "Get-ADDomain | Get-ADForest",
      requires: "Módulo ActiveDirectory (RSAT)",
      flags: [
        { flag: "DomainMode / ForestMode", description: "Nivel funcional." },
        { flag: "PDCEmulator / RIDMaster", description: "Qué controlador tiene cada rol." },
        { flag: "Sites / GlobalCatalogs", description: "Sitios y catálogos globales del bosque." }
      ],
      example: { command: "Get-ADDomain | Select-Object DNSRoot, DomainMode, PDCEmulator, RIDMaster, InfrastructureMaster; Get-ADForest | Select-Object ForestMode, SchemaMaster, DomainNamingMaster", explanation: "Primer vistazo a un dominio que no conoces, o antes de retirar un controlador: qué nivel funcional tiene y dónde están los cinco roles." },
      tags: ["dominio", "bosque", "nivel funcional", "fsmo", "roles"]
    },
    {
      id: "win-get-aduser-filter", name: "Get-ADUser -Filter (consultas útiles)", os: "windows", shell: "powershell", category: "ad", risk: "safe",
      description: "Busca usuarios por cualquier atributo: contraseñas que no caducan, cuentas sin uso, departamento.",
      syntax: "Get-ADUser -Filter '<condición>' [-SearchBase <OU>] -Properties <atributos> | Select-Object ...",
      requires: "Módulo ActiveDirectory (RSAT)",
      flags: [
        { flag: "-Filter 'Enabled -eq $true'", description: "Condición sobre atributos." },
        { flag: "-SearchBase", description: "Limita la búsqueda a una OU." },
        { flag: "-Properties", description: "Atributos extra que se cargan." }
      ],
      example: { command: "Get-ADUser -Filter 'Enabled -eq $true -and PasswordNeverExpires -eq $true' -Properties PasswordLastSet, LastLogonDate | Select-Object Name, SamAccountName, PasswordLastSet, LastLogonDate | Sort-Object PasswordLastSet", explanation: "Auditoría: cuentas activas cuya contraseña no caduca nunca, ordenadas de la más antigua a la más reciente." },
      tags: ["buscar usuarios", "auditoria", "contraseña sin caducidad", "filtro"]
    },
    {
      id: "win-get-lapsadpassword", name: "Get-LapsADPassword", os: "windows", shell: "powershell", category: "ad", risk: "caution",
      description: "Recupera la contraseña del administrador local de un equipo, gestionada y rotada por Windows LAPS.",
      syntax: "Get-LapsADPassword -Identity <equipo> [-AsPlainText] | Reset-LapsPassword",
      requires: "Windows LAPS desplegado y permiso de lectura sobre el equipo",
      flags: [
        { flag: "-Identity", description: "Equipo cuya contraseña se consulta." },
        { flag: "-AsPlainText", description: "La muestra en claro." },
        { flag: "ExpirationTimestamp", description: "Cuándo se cambiará sola." }
      ],
      example: { command: "Get-LapsADPassword -Identity PC-VENTAS-07 -AsPlainText | Select-Object ComputerName, Account, Password, ExpirationTimestamp", explanation: "Un portátil ha perdido la relación con el dominio y nadie puede entrar: obtén la contraseña del administrador local. La consulta queda auditada." },
      tags: ["laps", "administrador local", "contraseña local", "recuperar acceso"]
    },
    {
      id: "win-ad-replication", name: "Get-ADReplicationPartnerMetadata", os: "windows", shell: "powershell", category: "ad", risk: "safe",
      description: "Muestra cuándo replicó por última vez cada controlador de dominio con sus vecinos y si hubo errores.",
      syntax: "Get-ADReplicationPartnerMetadata -Target <controlador|*> [-Scope Server|Domain] | Get-ADReplicationFailure -Target <dominio>",
      requires: "Módulo ActiveDirectory (RSAT)",
      flags: [
        { flag: "-Target * -Scope Domain", description: "Todos los controladores del dominio." },
        { flag: "LastReplicationSuccess", description: "Última réplica correcta." },
        { flag: "Get-ADReplicationFailure", description: "Errores de réplica pendientes." }
      ],
      example: { command: "Get-ADReplicationPartnerMetadata -Target * -Scope Domain | Select-Object Server, Partner, LastReplicationSuccess, ConsecutiveReplicationFailures | Sort-Object LastReplicationSuccess", explanation: "Un cambio de contraseña no llega a otra sede: comprueba qué controlador lleva más tiempo sin replicar y cuántos fallos acumula." },
      tags: ["replicacion", "controladores de dominio", "sincronizacion", "sedes"]
    },
    {
      id: "win-lockout-source", name: "Origen de un bloqueo de cuenta (4740)", os: "windows", shell: "powershell", category: "ad", risk: "safe",
      description: "Localiza desde qué equipo se está bloqueando una cuenta, consultando el evento 4740 en el emulador de PDC.",
      syntax: "Get-WinEvent -ComputerName (Get-ADDomain).PDCEmulator -FilterHashtable @{ LogName = \"Security\"; Id = 4740 }",
      requires: "Módulo ActiveDirectory (RSAT)",
      flags: [
        { flag: "Id = 4740", description: "Cuenta bloqueada." },
        { flag: "Properties[0]", description: "Usuario bloqueado." },
        { flag: "Properties[1]", description: "Equipo que provocó el bloqueo." }
      ],
      example: { command: "Get-WinEvent -ComputerName (Get-ADDomain).PDCEmulator -FilterHashtable @{ LogName = \"Security\"; Id = 4740; StartTime = (Get-Date).AddDays(-1) } | Where-Object { $_.Properties[0].Value -eq \"jlopez\" } | Select-Object TimeCreated, @{ n = \"Equipo\"; e = { $_.Properties[1].Value } }", explanation: "La cuenta de un usuario se bloquea una y otra vez: suele ser un móvil o una unidad de red con la contraseña antigua guardada." },
      tags: ["bloqueo de cuenta", "4740", "origen", "contraseña antigua"]
    },
    {
      id: "win-new-vm", name: "New-VM", os: "windows", shell: "powershell", category: "virtualization", risk: "caution",
      description: "Crea una máquina virtual en Hyper-V con su disco, memoria y red.",
      syntax: "New-VM -Name <nombre> -Generation 2 -MemoryStartupBytes <tamaño> -NewVHDPath <ruta> -NewVHDSizeBytes <tamaño> -SwitchName <conmutador>",
      requires: "Rol Hyper-V y su módulo de PowerShell",
      flags: [
        { flag: "-Generation 2", description: "UEFI y arranque seguro." },
        { flag: "-MemoryStartupBytes 4GB", description: "Memoria inicial." },
        { flag: "-NewVHDSizeBytes 80GB", description: "Disco nuevo de expansión dinámica." }
      ],
      example: { command: "New-VM -Name web02 -Generation 2 -MemoryStartupBytes 4GB -NewVHDPath D:\\VM\\web02\\web02.vhdx -NewVHDSizeBytes 80GB -SwitchName \"vSwitch-LAN\"; Set-VM -Name web02 -ProcessorCount 2 -AutomaticStartAction Start", explanation: "Crea un servidor virtual nuevo, le asigna dos procesadores y hace que arranque solo cuando lo haga el anfitrión." },
      tags: ["hyper-v", "crear maquina virtual", "vhdx", "generacion 2"]
    },
    {
      id: "win-get-vmswitch", name: "Get-VMSwitch / New-VMSwitch", os: "windows", shell: "powershell", category: "virtualization", risk: "caution",
      description: "Listan y crean los conmutadores virtuales que conectan las máquinas de Hyper-V a la red.",
      syntax: "Get-VMSwitch | New-VMSwitch -Name <nombre> -NetAdapterName <adaptador> [-AllowManagementOS $true] | New-VMSwitch -Name <nombre> -SwitchType Internal",
      requires: "Rol Hyper-V y su módulo de PowerShell",
      flags: [
        { flag: "-NetAdapterName", description: "Externo: usa una tarjeta física." },
        { flag: "-SwitchType Internal", description: "Solo entre el anfitrión y las máquinas." },
        { flag: "-AllowManagementOS", description: "El anfitrión comparte esa tarjeta." }
      ],
      example: { command: "Get-NetAdapter -Physical | Select-Object Name, Status, LinkSpeed; New-VMSwitch -Name \"vSwitch-LAN\" -NetAdapterName \"Ethernet 2\" -AllowManagementOS $false", explanation: "Crea un conmutador externo sobre una tarjeta dedicada a las máquinas virtuales. Si usas la tarjeta de administración, perderás la conexión unos segundos." },
      tags: ["hyper-v", "conmutador virtual", "red virtual", "vswitch"]
    },
    {
      id: "win-wsl", name: "wsl", os: "windows", shell: "cmd", category: "virtualization", risk: "caution",
      description: "Instala y gestiona distribuciones de Linux dentro de Windows con WSL.",
      syntax: "wsl --install [-d distribución] | wsl -l -v | wsl -d distribución | wsl --shutdown | wsl --export distribución archivo.tar",
      flags: [
        { flag: "--install -d Ubuntu", description: "Instala WSL y esa distribución." },
        { flag: "-l -v", description: "Distribuciones, estado y versión de WSL." },
        { flag: "--shutdown", description: "Detiene todas y libera la memoria." },
        { flag: "--export / --import", description: "Copia de seguridad o traslado." }
      ],
      example: { command: "wsl -l -v && wsl -d Ubuntu -- bash -c \"lsb_release -ds && df -h /\"", explanation: "Comprueba qué distribuciones hay instaladas y ejecuta una orden de Linux sin salir de la consola de Windows." },
      tags: ["wsl", "linux en windows", "ubuntu", "subsistema"]
    },
    {
      id: "win-get-mailboxstatistics", name: "Get-Mailbox / Get-MailboxStatistics", os: "windows", shell: "powershell", category: "m365", risk: "safe",
      description: "Listan los buzones de Exchange Online y muestran su tamaño, número de elementos y último acceso.",
      syntax: "Get-Mailbox [-ResultSize Unlimited] [-RecipientTypeDetails <tipo>] | Get-MailboxStatistics",
      requires: "Módulo ExchangeOnlineManagement y sesión con Connect-ExchangeOnline",
      flags: [
        { flag: "-ResultSize Unlimited", description: "Todos los buzones, no solo 1000." },
        { flag: "-RecipientTypeDetails SharedMailbox", description: "Solo los compartidos." },
        { flag: "TotalItemSize", description: "Tamaño del buzón." }
      ],
      example: { command: "Get-Mailbox -ResultSize Unlimited | Get-MailboxStatistics | Sort-Object TotalItemSize -Descending | Select-Object -First 10 DisplayName, TotalItemSize, ItemCount, LastLogonTime", explanation: "Los diez buzones más grandes de la organización: quién está cerca del límite y necesita archivo o limpieza." },
      tags: ["buzones", "tamaño del buzon", "exchange online", "cuota"]
    },
    {
      id: "win-distributiongroupmember", name: "Get-DistributionGroupMember / Add-DistributionGroupMember", os: "windows", shell: "powershell", category: "m365", risk: "caution",
      description: "Consultan y modifican los miembros de las listas de distribución de Exchange Online.",
      syntax: "Get-DistributionGroupMember -Identity <lista> | Add-DistributionGroupMember -Identity <lista> -Member <usuario> | Remove-DistributionGroupMember",
      requires: "Módulo ExchangeOnlineManagement y sesión con Connect-ExchangeOnline",
      flags: [
        { flag: "Get-DistributionGroupMember", description: "Quién recibe los correos de la lista." },
        { flag: "Add-DistributionGroupMember", description: "Añade un miembro." },
        { flag: "Remove-DistributionGroupMember", description: "Lo quita." }
      ],
      example: { command: "Add-DistributionGroupMember -Identity ventas@empresa.com -Member aruiz@empresa.com; Get-DistributionGroupMember -Identity ventas@empresa.com | Select-Object DisplayName, PrimarySmtpAddress", explanation: "Añade a una persona nueva a la lista del departamento y comprueba quién la forma." },
      tags: ["lista de distribucion", "miembros", "exchange online", "correo del departamento"]
    }
  ]
};
