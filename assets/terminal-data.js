/* =========================================================================
 * Datos de la terminal simulada (formato JSON dentro de JS para funcionar también con file://).
 * Se renderiza SIEMPRE como texto, nunca como HTML.
 *
 * Textos traducibles: un string (se usa en los dos idiomas) o { es, en }.
 * Las salidas de los comandos se dejan como en un sistema real (en inglés).
 * Ver docs/terminal/HANDOFF.md para el esquema completo. Lo valida scripts/validate.js.
 * ========================================================================= */
window.SYS_TERMINAL_DATA = {
  version: 1,
  env: { user: "admin", host: "srv01", home: "/home/admin", cwd: "/home/admin" },

  fs: {
    "/": ["etc", "home", "var"],
    "/etc": ["hostname", "hosts", "os-release"],
    "/etc/hostname": "srv01",
    "/etc/hosts": "127.0.0.1   localhost\n10.0.0.20   srv01.corp.local srv01\n10.0.0.10   dc01.corp.local dc01",
    "/etc/os-release": "PRETTY_NAME=\"Ubuntu 24.04.1 LTS\"\nNAME=\"Ubuntu\"\nVERSION_ID=\"24.04\"\nID=ubuntu",
    "/home": ["admin"],
    "/home/admin": ["notas.txt", "scripts"],
    "/home/admin/notas.txt": "Pendiente: renovar certificado de web.empresa.com antes del día 30.",
    "/home/admin/scripts": ["backup.sh"],
    "/home/admin/scripts/backup.sh": "#!/usr/bin/env bash\nset -euo pipefail\nrsync -a /srv/www/ backup@nas01:/backups/www/",
    "/var": ["log"],
    "/var/log": ["syslog"],
    "/var/log/syslog": "Nov  8 09:12:01 srv01 CRON[2211]: (root) CMD (/usr/local/bin/backup.sh)\nNov  8 09:15:44 srv01 sshd[2380]: Accepted publickey for admin from 10.0.0.5 port 51234\nNov  8 09:16:02 srv01 systemd[1]: Reloaded nginx.service."
  },

  commands: {
    whoami: {
      libraryId: "linux-id",
      summary: { es: "Muestra el usuario actual.", en: "Shows the current user." },
      flags: {},
      output: ["admin"]
    },

    hostname: {
      libraryId: "linux-uptime",
      summary: { es: "Nombre del equipo.", en: "The machine's name." },
      flags: { "-I": { es: "Direcciones IP del equipo.", en: "The machine's IP addresses." } },
      variants: [{ flags: ["-I"], output: ["10.0.0.20 172.17.0.1"] }],
      output: ["srv01"]
    },

    uname: {
      libraryId: "linux-uptime",
      summary: { es: "Información del sistema y del kernel.", en: "System and kernel information." },
      flags: {
        "-a": { es: "Toda la información.", en: "All information." },
        "-r": { es: "Versión del kernel.", en: "Kernel release." },
        "-m": { es: "Arquitectura.", en: "Architecture." }
      },
      variants: [
        { flags: ["-a"], output: ["Linux srv01 6.8.0-48-generic #48-Ubuntu SMP x86_64 GNU/Linux"] },
        { flags: ["-r"], output: ["6.8.0-48-generic"] },
        { flags: ["-m"], output: ["x86_64"] }
      ],
      output: ["Linux"]
    },

    uptime: {
      libraryId: "linux-uptime",
      summary: { es: "Tiempo encendido y carga media.", en: "Uptime and load average." },
      flags: { "-p": { es: "Formato legible.", en: "Pretty format." } },
      variants: [{ flags: ["-p"], output: ["up 12 days, 4 hours, 7 minutes"] }],
      output: [" 09:21:33 up 12 days,  4:07,  1 user,  load average: 0.42, 0.37, 0.31"]
    },

    df: {
      libraryId: "linux-df-du",
      summary: { es: "Espacio libre por sistema de archivos.", en: "Free space per file system." },
      flags: {
        "-h": { es: "Tamaños legibles.", en: "Human-readable sizes." },
        "-T": { es: "Muestra el tipo de sistema de archivos.", en: "Shows the file system type." }
      },
      variants: [
        { flags: ["-h"], output: [
          "Filesystem      Size  Used Avail Use% Mounted on",
          "/dev/sda2        49G   31G   16G  67% /",
          { text: "/dev/sdb1       200G  188G   12G  95% /data", style: "warn" },
          "tmpfs           1.9G     0  1.9G   0% /dev/shm"
        ]},
        { flags: ["-h", "-T"], output: [
          "Filesystem     Type   Size  Used Avail Use% Mounted on",
          "/dev/sda2      ext4    49G   31G   16G  67% /",
          { text: "/dev/sdb1      xfs    200G  188G   12G  95% /data", style: "warn" }
        ]}
      ],
      output: [
        "Filesystem     1K-blocks      Used Available Use% Mounted on",
        "/dev/sda2       51290592  32505880  16149460  67% /",
        "/dev/sdb1      209612800 197130240  12482560  95% /data"
      ]
    },

    free: {
      libraryId: "linux-free-vmstat",
      summary: { es: "Memoria y swap.", en: "Memory and swap." },
      flags: { "-h": { es: "Tamaños legibles.", en: "Human-readable sizes." } },
      variants: [{ flags: ["-h"], output: [
        "               total        used        free      shared  buff/cache   available",
        "Mem:           3.8Gi       2.1Gi       312Mi        24Mi       1.4Gi       1.5Gi",
        "Swap:          2.0Gi       180Mi       1.8Gi"
      ]}],
      output: [
        "               total        used        free      shared  buff/cache   available",
        "Mem:         3995648     2201600      319488       24576     1474560     1572864",
        "Swap:        2097148      184320     1912828"
      ]
    },

    ss: {
      libraryId: "linux-ss",
      summary: { es: "Sockets: puertos en escucha y conexiones.", en: "Sockets: listening ports and connections." },
      flags: {
        "-t": { es: "Solo TCP.", en: "TCP only." },
        "-u": { es: "Solo UDP.", en: "UDP only." },
        "-l": { es: "Solo en escucha.", en: "Listening only." },
        "-n": { es: "Sin resolver nombres.", en: "No name resolution." },
        "-p": { es: "Muestra el proceso.", en: "Shows the process." }
      },
      variants: [
        { flags: ["-t", "-l", "-n"], output: [
          "State   Recv-Q  Send-Q  Local Address:Port   Peer Address:Port",
          "LISTEN  0       511           0.0.0.0:80          0.0.0.0:*",
          "LISTEN  0       511           0.0.0.0:443         0.0.0.0:*",
          "LISTEN  0       128           0.0.0.0:22          0.0.0.0:*",
          "LISTEN  0       80          127.0.0.1:3306        0.0.0.0:*"
        ]},
        { flags: ["-t", "-u", "-l", "-n", "-p"], output: [
          "Netid State  Local Address:Port  Process",
          "udp   UNCONN     0.0.0.0:68      users:((\"dhclient\",pid=612,fd=6))",
          "tcp   LISTEN     0.0.0.0:80      users:((\"nginx\",pid=1021,fd=6))",
          "tcp   LISTEN     0.0.0.0:443     users:((\"nginx\",pid=1021,fd=7))",
          "tcp   LISTEN     0.0.0.0:22      users:((\"sshd\",pid=844,fd=3))",
          "tcp   LISTEN   127.0.0.1:3306    users:((\"mariadbd\",pid=930,fd=21))"
        ]}
      ],
      output: [
        "Netid State  Recv-Q Send-Q  Local Address:Port   Peer Address:Port",
        "tcp   ESTAB  0      0           10.0.0.20:22         10.0.0.5:51234"
      ]
    },

    ip: {
      libraryId: "linux-ip",
      summary: { es: "Interfaces, direcciones y rutas.", en: "Interfaces, addresses and routes." },
      flags: {
        "-br": { es: "Resumen breve.", en: "Brief summary." },
        "-c": { es: "Con colores.", en: "Coloured output." }
      },
      subcommands: { a: "addr", addr: "addr", address: "addr", r: "route", route: "route" },
      variants: [
        { sub: "addr", flags: ["-br"], output: [
          "lo               UNKNOWN        127.0.0.1/8 ::1/128",
          "ens18            UP             10.0.0.20/24 fe80::be24:11ff:fe2a:9c1/64"
        ]},
        { sub: "addr", flags: [], output: [
          "2: ens18: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP",
          "    link/ether bc:24:11:2a:09:c1 brd ff:ff:ff:ff:ff:ff",
          "    inet 10.0.0.20/24 brd 10.0.0.255 scope global ens18"
        ]},
        { sub: "route", flags: [], output: [
          "default via 10.0.0.1 dev ens18 proto static",
          "10.0.0.0/24 dev ens18 proto kernel scope link src 10.0.0.20"
        ]}
      ],
      usage: [{ es: "Uso: ip [-br] [-c] { addr | route }", en: "Usage: ip [-br] [-c] { addr | route }" }]
    },

    ping: {
      libraryId: "win-test-connection",
      summary: { es: "Comprueba la conectividad ICMP.", en: "Checks ICMP connectivity." },
      flags: { "-c": { description: { es: "Número de paquetes.", en: "Number of packets." }, takesValue: true } },
      requiresArgs: 1,
      tryExample: "ping -c 3 dc01",
      usage: [{ es: "Uso: ping [-c N] destino", en: "Usage: ping [-c N] destination" }],
      stream: { delayMs: 350 },
      output: [
        "PING {arg0} ({ip}) 56(84) bytes of data.",
        "64 bytes from {arg0} ({ip}): icmp_seq=1 ttl=63 time=0.84 ms",
        "64 bytes from {arg0} ({ip}): icmp_seq=2 ttl=63 time=0.79 ms",
        "64 bytes from {arg0} ({ip}): icmp_seq=3 ttl=63 time=0.81 ms",
        "",
        "--- {arg0} ping statistics ---",
        { text: "3 packets transmitted, 3 received, 0% packet loss, time 2003ms", style: "ok" }
      ]
    },

    systemctl: {
      libraryId: "linux-systemctl",
      summary: { es: "Controla servicios de systemd.", en: "Controls systemd services." },
      flags: { "--no-pager": { es: "Sin paginador.", en: "No pager." } },
      variants: [
        { args: ["status", "nginx"], output: [
          { text: "● nginx.service - A high performance web server", style: "ok" },
          "     Loaded: loaded (/usr/lib/systemd/system/nginx.service; enabled)",
          { text: "     Active: active (running) since Fri 2026-11-07 18:02:11 CET; 15h ago", style: "ok" },
          "   Main PID: 1021 (nginx)"
        ]},
        { args: ["status", "mariadb"], output: [
          { text: "● mariadb.service - MariaDB 10.11 database server", style: "ok" },
          { text: "     Active: active (running) since Fri 2026-11-07 18:02:09 CET; 15h ago", style: "ok" }
        ]},
        { args: ["restart", "*"], output: [
          { text: { es: "Simulador: no se reinicia nada de verdad. En un servidor real usa «sudo systemctl restart <servicio>».",
                    en: "Simulator: nothing is actually restarted. On a real server use \"sudo systemctl restart <service>\"." }, style: "dim" }
        ]}
      ],
      usage: [{ es: "Uso: systemctl status|restart <servicio>   (prueba: systemctl status nginx)",
                en: "Usage: systemctl status|restart <service>   (try: systemctl status nginx)" }]
    },

    rm: {
      libraryId: "linux-rm",
      summary: { es: "Borra archivos (simulado: no borra nada).", en: "Deletes files (simulated: deletes nothing)." },
      flags: {
        "-r": { es: "Recursivo.", en: "Recursive." },
        "-f": { es: "Forzado.", en: "Force." },
        "-i": { es: "Pregunta antes.", en: "Prompt first." }
      },
      danger: true,
      requiresArgs: 1,
      tryExample: "rm -rf /opt/app/releases/old",
      output: [
        { text: { es: "⚠ Comando destructivo. En el simulador no se borra nada.", en: "⚠ Destructive command. Nothing is deleted in the simulator." }, style: "error" },
        { text: { es: "En un servidor real, «{cmdline}» eliminaría los archivos sin papelera ni confirmación.",
                  en: "On a real server, \"{cmdline}\" would delete the files with no recycle bin and no confirmation." }, style: "dim" }
      ]
    }
  }
};
