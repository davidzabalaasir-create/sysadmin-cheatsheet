/* =========================================================================
 * SysAdmin Cheat Sheet — Dataset
 * Mismo esquema que data/commands.example.json (embebido como JS para que
 * la app funcione abriendo index.html directamente, sin servidor).
 * ========================================================================= */
window.CHEATSHEET = {
  categories: [
    { id: "users",      label: "Usuarios y Permisos",      labelEn: "User & Privilege Management", icon: "users",   os: ["linux", "windows"] },
    { id: "filesystem", label: "Archivos y Directorios",   labelEn: "File System",                 icon: "folder",  os: ["linux", "windows"] },
    { id: "network",    label: "Redes y Diagnóstico",      labelEn: "Networking & Troubleshooting",icon: "network", os: ["linux", "windows"] },
    { id: "processes",  label: "Procesos y Rendimiento",   labelEn: "Process & System Monitoring", icon: "cpu",     os: ["linux", "windows"] },
    { id: "security",   label: "Seguridad y Auditoría",    labelEn: "Security & Logs",             icon: "shield",  os: ["linux", "windows"] },
    { id: "automation", label: "Automatización y Tareas",  labelEn: "Automation & Crons",          icon: "clock",   os: ["linux", "windows"] },
    { id: "storage",    label: "Almacenamiento y Discos",  labelEn: "Storage & Disks",             icon: "disk",    os: ["linux", "windows"] },
    { id: "ad",         label: "Active Directory / LDAP",  labelEn: "Active Directory / LDAP",     icon: "tree",    os: ["windows"] }
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
    }
  ]
};
