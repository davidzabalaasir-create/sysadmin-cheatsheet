/* =========================================================================
 * SysAdmin Cheat Sheet — Dataset
 * Mismo esquema que data/commands.example.json (embebido como JS para que
 * la app funcione abriendo index.html directamente, sin servidor).
 * ========================================================================= */
window.CHEATSHEET = {
  version: "1.2.0", // debe coincidir con APP_VERSION de index.html (ver AGENTS.md)
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
    }
  ]
};
