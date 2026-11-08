/* =========================================================================
 * Datos de la terminal simulada (formato JSON dentro de JS para funcionar también con file://).
 * Se renderiza SIEMPRE como texto, nunca como HTML.
 *
 * Textos traducibles: un string (se usa en los dos idiomas) o { es, en }.
 * Las salidas de los comandos se dejan como en un sistema real (en inglés).
 * Hay dos sistemas: Linux (env, fs, commands) y Windows (windows: { env, fs, commands }).
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
      libraryId: "linux-mtr",
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
  },

  /* ---------------------------------------------------------------------------------------------
   * Windows (PowerShell). Mismo esquema que Linux, con estas diferencias:
   *  - Nombres, alias, parámetros y subcomandos no distinguen mayúsculas (Get-Service = get-service).
   *  - Los parámetros pueden ser de PowerShell (-Name) o de cmd (/all).
   *  - «aliases» son otros nombres del mismo comando (gsv, gps…).
   *  - «sample» es el valor que sustituye a «*» en los ejemplos de help.
   *  - Las rutas del FS se guardan con «/» y se muestran como C:\…
   * ------------------------------------------------------------------------------------------- */
  windows: {
    env: { user: "admin", host: "SRV02", home: "/Users/admin", cwd: "/Users/admin" },

    fs: {
      "/": ["inetpub", "Users", "Windows"],
      "/inetpub": ["logs"],
      "/inetpub/logs": ["LogFiles"],
      "/inetpub/logs/LogFiles": ["u_ex261108.log"],
      "/inetpub/logs/LogFiles/u_ex261108.log": "#Fields: date time s-ip cs-method cs-uri-stem sc-status\n2026-11-08 08:58:12 10.0.0.21 GET /intranet/ 200\n2026-11-08 09:01:40 10.0.0.21 GET /intranet/login 200\n2026-11-08 09:02:03 10.0.0.21 POST /intranet/login 401\n2026-11-08 09:02:19 10.0.0.21 POST /intranet/login 302",
      "/Users": ["admin", "Public"],
      "/Users/Public": [],
      "/Users/admin": ["Desktop", "Documents", "notas.txt"],
      "/Users/admin/Desktop": [],
      "/Users/admin/notas.txt": "Pendiente: desbloquear la cuenta de jlopez y revisar la cuota de \\\\srv01\\compartido.",
      "/Users/admin/Documents": ["alta-usuarios.csv", "backup.ps1"],
      "/Users/admin/Documents/alta-usuarios.csv": "Nombre,Apellido,Usuario,Departamento\nJuan,López,jlopez,Ventas\nAna,Ruiz,aruiz,Contabilidad",
      "/Users/admin/Documents/backup.ps1": "$fecha = Get-Date -Format yyyyMMdd\nrobocopy D:\\Datos \\\\srv01\\backup\\$fecha /MIR /R:2 /W:5 /LOG:C:\\Logs\\backup-$fecha.log",
      "/Windows": ["System32"],
      "/Windows/System32": ["drivers"],
      "/Windows/System32/drivers": ["etc"],
      "/Windows/System32/drivers/etc": ["hosts"],
      "/Windows/System32/drivers/etc/hosts": "# Copyright (c) 1993-2009 Microsoft Corp.\n127.0.0.1       localhost\n10.0.0.10       dc01.corp.local dc01\n10.0.0.20       srv01.corp.local srv01"
    },

    commands: {
      whoami: {
        libraryId: "win-whoami",
        summary: { es: "Usuario actual, sus grupos y privilegios.", en: "Current user, their groups and privileges." },
        flags: {
          "/all": { es: "Usuario, SID, grupos y privilegios.", en: "User, SID, groups and privileges." },
          "/groups": { es: "Solo los grupos.", en: "Groups only." },
          "/upn": { es: "Nombre principal (UPN).", en: "User principal name (UPN)." }
        },
        tryExample: "whoami /groups",
        variants: [
          { flags: ["/upn"], output: ["admin@corp.local"] },
          { flags: ["/groups"], output: [
            "",
            "GROUP INFORMATION",
            "-----------------",
            "",
            "Group Name                          Type             SID",
            "=================================== ================ ============================================",
            "Everyone                            Well-known group S-1-1-0",
            "BUILTIN\\Administrators              Alias            S-1-5-32-544",
            "CORP\\Domain Admins                  Group            S-1-5-21-3623811015-3361044348-30300820-512",
            "CORP\\GG_Soporte_IT                  Group            S-1-5-21-3623811015-3361044348-30300820-1115",
            { text: "Mandatory Label\\High Mandatory Level Label            S-1-16-12288", style: "dim" }
          ]},
          { flags: ["/all"], output: [
            "",
            "USER INFORMATION",
            "----------------",
            "",
            "User Name  SID",
            "========== =============================================",
            "corp\\admin S-1-5-21-3623811015-3361044348-30300820-1104",
            "",
            "GROUP INFORMATION",
            "-----------------",
            "BUILTIN\\Administrators              Alias            S-1-5-32-544",
            "CORP\\Domain Admins                  Group            S-1-5-21-3623811015-3361044348-30300820-512",
            "",
            "PRIVILEGES INFORMATION",
            "----------------------",
            "SeShutdownPrivilege           Shut down the system                 Disabled",
            "SeChangeNotifyPrivilege       Bypass traverse checking             Enabled",
            "SeImpersonatePrivilege        Impersonate a client after auth      Enabled"
          ]}
        ],
        output: ["corp\\admin"]
      },

      hostname: {
        libraryId: "win-systeminfo",
        summary: { es: "Nombre del equipo.", en: "The machine's name." },
        flags: {},
        output: ["SRV02"]
      },

      ipconfig: {
        libraryId: "win-ipconfig",
        summary: { es: "Configuración IP de los adaptadores.", en: "IP configuration of the adapters." },
        flags: {
          "/all": { es: "Detalle completo: MAC, DHCP, DNS.", en: "Full detail: MAC, DHCP, DNS." },
          "/flushdns": { es: "Vacía la caché DNS.", en: "Flushes the DNS cache." },
          "/displaydns": { es: "Muestra la caché DNS.", en: "Shows the DNS cache." },
          "/release": { es: "Libera la concesión DHCP.", en: "Releases the DHCP lease." },
          "/renew": { es: "Renueva la concesión DHCP.", en: "Renews the DHCP lease." }
        },
        tryExample: "ipconfig /all",
        variants: [
          { flags: ["/all"], output: [
            "",
            "Windows IP Configuration",
            "",
            "   Host Name . . . . . . . . . . . . : SRV02",
            "   Primary Dns Suffix  . . . . . . . : corp.local",
            "   Node Type . . . . . . . . . . . . : Hybrid",
            "   IP Routing Enabled. . . . . . . . : No",
            "",
            "Ethernet adapter Ethernet0:",
            "",
            "   Connection-specific DNS Suffix  . : corp.local",
            "   Description . . . . . . . . . . . : vmxnet3 Ethernet Adapter",
            "   Physical Address. . . . . . . . . : 00-50-56-A1-3C-7E",
            "   DHCP Enabled. . . . . . . . . . . : No",
            { text: "   IPv4 Address. . . . . . . . . . . : 10.0.0.21(Preferred)", style: "ok" },
            "   Subnet Mask . . . . . . . . . . . : 255.255.255.0",
            "   Default Gateway . . . . . . . . . : 10.0.0.1",
            "   DNS Servers . . . . . . . . . . . : 10.0.0.10",
            "   NetBIOS over Tcpip. . . . . . . . : Enabled"
          ]},
          { flags: ["/flushdns"], output: ["", "Windows IP Configuration", "", { text: "Successfully flushed the DNS Resolver Cache.", style: "ok" }] },
          { flags: ["/displaydns"], output: [
            "", "Windows IP Configuration", "",
            "    dc01.corp.local",
            "    ----------------------------------------",
            "    Record Name . . . . . : dc01.corp.local",
            "    Record Type . . . . . : 1",
            "    Time To Live  . . . . : 1165",
            "    A (Host) Record . . . : 10.0.0.10"
          ]},
          { flags: ["/release"], output: [
            { text: { es: "Simulador: no se libera nada. SRV02 tiene IP estática, así que en un servidor real esto no haría nada (y en un cliente DHCP cortaría la red).",
                      en: "Simulator: nothing is released. SRV02 has a static IP, so on a real server this would do nothing (and on a DHCP client it would cut the network)." }, style: "warn" }
          ]},
          { flags: ["/renew"], output: [
            { text: { es: "Simulador: el adaptador Ethernet0 tiene IP estática; no hay concesión DHCP que renovar.",
                      en: "Simulator: adapter Ethernet0 has a static IP; there is no DHCP lease to renew." }, style: "dim" }
          ]}
        ],
        output: [
          "",
          "Windows IP Configuration",
          "",
          "Ethernet adapter Ethernet0:",
          "",
          "   Connection-specific DNS Suffix  . : corp.local",
          "   IPv4 Address. . . . . . . . . . . : 10.0.0.21",
          "   Subnet Mask . . . . . . . . . . . : 255.255.255.0",
          "   Default Gateway . . . . . . . . . : 10.0.0.1"
        ]
      },

      "Get-Service": {
        libraryId: "win-get-service",
        aliases: ["gsv"],
        summary: { es: "Lista servicios y su estado.", en: "Lists services and their status." },
        flags: { "-Name": { es: "Nombre del servicio (también sin -Name).", en: "Service name (also without -Name)." } },
        sample: "Spooler",
        tryExample: "Get-Service -Name Spooler",
        variants: [
          { flags: ["-Name"], args: ["spooler"], output: ["", "Status   Name               DisplayName", "------   ----               -----------", { text: "Running  Spooler            Print Spooler", style: "ok" }, ""] },
          { flags: [], args: ["spooler"], output: ["", "Status   Name               DisplayName", "------   ----               -----------", { text: "Running  Spooler            Print Spooler", style: "ok" }, ""] },
          { flags: ["-Name"], args: ["w3svc"], output: ["", "Status   Name               DisplayName", "------   ----               -----------", { text: "Running  W3SVC              World Wide Web Publishing Service", style: "ok" }, ""] },
          { flags: [], args: ["w3svc"], output: ["", "Status   Name               DisplayName", "------   ----               -----------", { text: "Running  W3SVC              World Wide Web Publishing Service", style: "ok" }, ""] },
          { flags: ["-Name"], args: ["*"], output: [{ text: "Get-Service : Cannot find any service with service name '{arg0}'.", style: "error" }] },
          { flags: [], args: ["*"], output: [{ text: "Get-Service : Cannot find any service with service name '{arg0}'.", style: "error" }] }
        ],
        output: [
          "",
          "Status   Name               DisplayName",
          "------   ----               -----------",
          { text: "Running  Dnscache           DNS Client", style: "ok" },
          { text: "Running  EventLog           Windows Event Log", style: "ok" },
          { text: "Running  LanmanServer       Server", style: "ok" },
          { text: "Running  Spooler            Print Spooler", style: "ok" },
          { text: "Stopped  wuauserv           Windows Update", style: "warn" },
          { text: "Running  W3SVC              World Wide Web Publishing Service", style: "ok" },
          { text: "Running  WinRM              Windows Remote Management (WS-Manag...", style: "ok" },
          ""
        ]
      },

      "Restart-Service": {
        libraryId: "win-get-service",
        summary: { es: "Reinicia un servicio (simulado).", en: "Restarts a service (simulated)." },
        flags: { "-Name": { es: "Nombre del servicio.", en: "Service name." }, "-Force": { es: "Reinicia también los dependientes.", en: "Also restarts dependent services." } },
        requiresArgs: 1,
        sample: "Spooler",
        tryExample: "Restart-Service -Name Spooler",
        usage: [{ es: "Uso: Restart-Service [-Name] <servicio> [-Force]", en: "Usage: Restart-Service [-Name] <service> [-Force]" }],
        variants: [
          { flags: ["-Name"], args: ["*"], output: [{ text: { es: "Simulador: no se reinicia nada. En un servidor real se reiniciaría «{arg0}» y sus clientes notarían un corte breve.", en: "Simulator: nothing is restarted. On a real server \"{arg0}\" would restart and its clients would notice a brief outage." }, style: "dim" }] },
          { flags: ["-Name", "-Force"], args: ["*"], output: [{ text: { es: "Simulador: no se reinicia nada. Con -Force también se reiniciarían los servicios que dependen de «{arg0}».", en: "Simulator: nothing is restarted. With -Force the services that depend on \"{arg0}\" would also restart." }, style: "dim" }] }
        ],
        output: [{ text: { es: "Simulador: no se reinicia nada. En un servidor real se reiniciaría «{arg0}».", en: "Simulator: nothing is restarted. On a real server \"{arg0}\" would restart." }, style: "dim" }]
      },

      "Get-Process": {
        libraryId: "win-get-process",
        aliases: ["gps", "ps"],
        summary: { es: "Procesos en ejecución con CPU y memoria.", en: "Running processes with CPU and memory." },
        flags: { "-Name": { es: "Filtra por nombre.", en: "Filters by name." } },
        sample: "w3wp",
        tryExample: "Get-Process -Name w3wp",
        variants: [
          { flags: ["-Name"], args: ["w3wp"], output: [
            "",
            "Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName",
            "-------  ------    -----      -----     ------     --  -- -----------",
            "   1384      88   412604     398220     912.44   4120   0 w3wp",
            ""
          ]},
          { flags: ["-Name"], args: ["*"], output: [{ text: "Get-Process : Cannot find a process with the name \"{arg0}\". Verify the process name and call the cmdlet again.", style: "error" }] }
        ],
        output: [
          "",
          "Handles  NPM(K)    PM(K)      WS(K)     CPU(s)     Id  SI ProcessName",
          "-------  ------    -----      -----     ------     --  -- -----------",
          "    412      22     6120      18344       2.13   2284   0 dns",
          "   1802      61    84512     102440      48.90    712   0 lsass",
          "    688      35    61204      74010       9.77   3012   1 powershell",
          "    502      28    11880      21456       1.02   1640   0 spoolsv",
          "    245      14     4012      12280       0.41    604   0 svchost",
          { text: "   1384      88   412604     398220     912.44   4120   0 w3wp", style: "warn" },
          ""
        ]
      },

      "Stop-Process": {
        libraryId: "win-taskkill",
        aliases: ["kill", "spps"],
        summary: { es: "Termina un proceso (simulado).", en: "Ends a process (simulated)." },
        flags: { "-Name": { es: "Por nombre.", en: "By name." }, "-Id": { es: "Por PID.", en: "By PID." }, "-Force": { es: "Sin pedir confirmación.", en: "Without asking for confirmation." } },
        danger: true,
        requiresArgs: 1,
        tryExample: "Stop-Process -Name w3wp -Force",
        output: [
          { text: { es: "⚠ En el simulador no se termina ningún proceso.", en: "⚠ No process is ended in the simulator." }, style: "warn" },
          { text: { es: "En un servidor real, «{cmdline}» cerraría el proceso sin guardar su trabajo; con w3wp cortaría la web hasta que IIS lo vuelva a lanzar.",
                    en: "On a real server, \"{cmdline}\" would close the process without saving its work; with w3wp the website would go down until IIS starts it again." }, style: "dim" }
        ]
      },

      "Test-NetConnection": {
        libraryId: "win-test-netconnection",
        aliases: ["tnc"],
        summary: { es: "Prueba conectividad y un puerto TCP.", en: "Tests connectivity and a TCP port." },
        flags: {
          "-ComputerName": { es: "Equipo de destino (también sin el parámetro).", en: "Target computer (also without the parameter)." },
          "-Port": { description: { es: "Puerto TCP que se prueba.", en: "TCP port to test." }, takesValue: true },
          "-InformationLevel": { description: { es: "Quiet devuelve solo True/False.", en: "Quiet returns just True/False." }, takesValue: true }
        },
        requiresArgs: 1,
        sample: "srv01",
        tryExample: "Test-NetConnection srv01 -Port 443",
        usage: [{ es: "Uso: Test-NetConnection <equipo> [-Port N]   (prueba: tnc srv01 -Port 443)", en: "Usage: Test-NetConnection <computer> [-Port N]   (try: tnc srv01 -Port 443)" }],
        stream: { delayMs: 260 },
        variants: [
          { flags: ["-Port"], output: [
            "",
            "ComputerName     : {arg0}",
            "RemoteAddress    : {ip}",
            "RemotePort       : {port}",
            "InterfaceAlias   : Ethernet0",
            "SourceAddress    : 10.0.0.21",
            { text: "TcpTestSucceeded : True", style: "ok" },
            ""
          ]},
          { flags: ["-ComputerName", "-Port"], output: [
            "",
            "ComputerName     : {arg0}",
            "RemoteAddress    : {ip}",
            "RemotePort       : {port}",
            "InterfaceAlias   : Ethernet0",
            "SourceAddress    : 10.0.0.21",
            { text: "TcpTestSucceeded : True", style: "ok" },
            ""
          ]},
          { flags: ["-Port", "-InformationLevel"], output: [{ text: "True", style: "ok" }] },
          { flags: ["-ComputerName"], output: [
            "",
            "ComputerName           : {arg0}",
            "RemoteAddress          : {ip}",
            "InterfaceAlias         : Ethernet0",
            "SourceAddress          : 10.0.0.21",
            { text: "PingSucceeded          : True", style: "ok" },
            "PingReplyDetails (RTT) : 1 ms",
            ""
          ]}
        ],
        output: [
          "",
          "ComputerName           : {arg0}",
          "RemoteAddress          : {ip}",
          "InterfaceAlias         : Ethernet0",
          "SourceAddress          : 10.0.0.21",
          { text: "PingSucceeded          : True", style: "ok" },
          "PingReplyDetails (RTT) : 1 ms",
          ""
        ]
      },

      ping: {
        libraryId: "win-test-connection",
        summary: { es: "Comprueba la conectividad ICMP (4 paquetes).", en: "Checks ICMP connectivity (4 packets)." },
        flags: {
          "-n": { description: { es: "Número de paquetes.", en: "Number of packets." }, takesValue: true },
          "-t": { es: "Sin fin, hasta Ctrl+C.", en: "Endless, until Ctrl+C." }
        },
        requiresArgs: 1,
        sample: "dc01",
        tryExample: "ping dc01",
        usage: [{ es: "Uso: ping [-n N] destino", en: "Usage: ping [-n N] destination" }],
        stream: { delayMs: 350 },
        output: [
          "",
          "Pinging {arg0} [{ip}] with 32 bytes of data:",
          "Reply from {ip}: bytes=32 time<1ms TTL=128",
          "Reply from {ip}: bytes=32 time=1ms TTL=128",
          "Reply from {ip}: bytes=32 time<1ms TTL=128",
          "Reply from {ip}: bytes=32 time<1ms TTL=128",
          "",
          "Ping statistics for {ip}:",
          { text: "    Packets: Sent = 4, Received = 4, Lost = 0 (0% loss),", style: "ok" },
          "Approximate round trip times in milli-seconds:",
          "    Minimum = 0ms, Maximum = 1ms, Average = 0ms"
        ]
      },

      "Test-Connection": {
        libraryId: "win-test-connection",
        summary: { es: "Ping de PowerShell que devuelve objetos.", en: "PowerShell ping that returns objects." },
        flags: {
          "-ComputerName": { es: "Equipo de destino.", en: "Target computer." },
          "-Count": { description: { es: "Número de pings.", en: "Number of pings." }, takesValue: true },
          "-Quiet": { es: "Devuelve solo True/False.", en: "Returns just True/False." }
        },
        requiresArgs: 1,
        sample: "dc01",
        tryExample: "Test-Connection dc01 -Count 2",
        stream: { delayMs: 350 },
        variants: [
          { flags: ["-Count"], output: ["", "Source        Destination     IPV4Address      Bytes    Time(ms)", "------        -----------     -----------      -----    --------", "SRV02         {arg0}          {ip}        32       0", "SRV02         {arg0}          {ip}        32       1", ""] },
          { flags: ["-ComputerName"], output: ["", "Source        Destination     IPV4Address      Bytes    Time(ms)", "------        -----------     -----------      -----    --------", "SRV02         {arg0}          {ip}        32       0", ""] },
          { flags: ["-Quiet"], output: [{ text: "True", style: "ok" }] },
          { flags: ["-Count", "-Quiet"], output: [{ text: "True", style: "ok" }] }
        ],
        output: [
          "",
          "Source        Destination     IPV4Address      Bytes    Time(ms)",
          "------        -----------     -----------      -----    --------",
          "SRV02         {arg0}          {ip}        32       0",
          "SRV02         {arg0}          {ip}        32       1",
          ""
        ]
      },

      tracert: {
        libraryId: "win-pathping",
        summary: { es: "Ruta salto a salto hasta un destino.", en: "Hop-by-hop route to a destination." },
        flags: { "-d": { es: "Sin resolver nombres.", en: "No name resolution." } },
        requiresArgs: 1,
        sample: "srv01",
        tryExample: "tracert -d srv01",
        stream: { delayMs: 400 },
        output: [
          "",
          "Tracing route to {arg0} [{ip}]",
          "over a maximum of 30 hops:",
          "",
          "  1    <1 ms    <1 ms    <1 ms  10.0.0.1",
          "  2     1 ms    <1 ms    <1 ms  {ip}",
          "",
          { text: "Trace complete.", style: "ok" }
        ]
      },

      "Resolve-DnsName": {
        libraryId: "win-resolve-dnsname",
        summary: { es: "Consulta DNS (como nslookup, pero con objetos).", en: "DNS lookup (like nslookup, but with objects)." },
        flags: {
          "-Name": { es: "Nombre que se consulta.", en: "Name to look up." },
          "-Type": { description: { es: "Tipo de registro: A, MX, SRV…", en: "Record type: A, MX, SRV…" }, takesValue: true },
          "-Server": { description: { es: "Servidor DNS al que se pregunta.", en: "DNS server to ask." }, takesValue: true }
        },
        requiresArgs: 1,
        sample: "srv01.corp.local",
        tryExample: "Resolve-DnsName srv01.corp.local",
        variants: [
          { flags: ["-Name"], output: ["", "Name                                           Type   TTL   Section    IPAddress", "----                                           ----   ---   -------    ---------", "{arg0}                               A      1200  Answer     {ip}", ""] },
          { flags: ["-Type"], args: ["*"], output: [
            "",
            "Name                           Type   TTL   Section    NameExchange                Preference",
            "----                           ----   ---   -------    ------------                ----------",
            "{arg0}                         {type}     3600  Answer     mail.{arg0}                 10",
            ""
          ]}
        ],
        output: [
          "",
          "Name                                           Type   TTL   Section    IPAddress",
          "----                                           ----   ---   -------    ---------",
          "{arg0}                               A      1200  Answer     {ip}",
          ""
        ]
      },

      netstat: {
        libraryId: "win-netstat",
        summary: { es: "Conexiones y puertos en escucha.", en: "Connections and listening ports." },
        flags: {
          "-a": { es: "Todas las conexiones y puertos en escucha.", en: "All connections and listening ports." },
          "-n": { es: "Direcciones en número.", en: "Numeric addresses." },
          "-o": { es: "Muestra el PID del proceso.", en: "Shows the process PID." }
        },
        tryExample: "netstat -ano",
        variants: [
          { flags: ["-a", "-n", "-o"], output: [
            "",
            "Active Connections",
            "",
            "  Proto  Local Address          Foreign Address        State           PID",
            "  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING       4",
            "  TCP    0.0.0.0:135            0.0.0.0:0              LISTENING       940",
            "  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING       4",
            "  TCP    0.0.0.0:445            0.0.0.0:0              LISTENING       4",
            "  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING       1188",
            "  TCP    0.0.0.0:5985           0.0.0.0:0              LISTENING       4",
            "  TCP    10.0.0.21:3389         10.0.0.5:53122         ESTABLISHED     1188",
            "  TCP    10.0.0.21:49712        10.0.0.10:389          ESTABLISHED     712"
          ]},
          { flags: ["-a", "-n"], output: [
            "",
            "Active Connections",
            "",
            "  Proto  Local Address          Foreign Address        State",
            "  TCP    0.0.0.0:80             0.0.0.0:0              LISTENING",
            "  TCP    0.0.0.0:443            0.0.0.0:0              LISTENING",
            "  TCP    0.0.0.0:3389           0.0.0.0:0              LISTENING",
            "  TCP    10.0.0.21:3389         10.0.0.5:53122         ESTABLISHED"
          ]}
        ],
        output: [
          "",
          "Active Connections",
          "",
          "  Proto  Local Address          Foreign Address        State",
          "  TCP    10.0.0.21:3389         admin-pc:53122         ESTABLISHED",
          "  TCP    10.0.0.21:49712        dc01:ldap              ESTABLISHED"
        ]
      },

      "Get-NetTCPConnection": {
        libraryId: "win-get-nettcpconnection",
        summary: { es: "Conexiones TCP como objetos (filtrables).", en: "TCP connections as objects (filterable)." },
        flags: {
          "-State": { description: { es: "Listen, Established…", en: "Listen, Established…" }, takesValue: true },
          "-LocalPort": { description: { es: "Puerto local.", en: "Local port." }, takesValue: true }
        },
        tryExample: "Get-NetTCPConnection -State Listen",
        variants: [
          { flags: ["-State"], output: [
            "",
            "LocalAddress  LocalPort RemoteAddress RemotePort State       OwningProcess",
            "------------  --------- ------------- ---------- -----       -------------",
            "0.0.0.0       5985      0.0.0.0       0          Listen      4",
            "0.0.0.0       3389      0.0.0.0       0          Listen      1188",
            "0.0.0.0       445       0.0.0.0       0          Listen      4",
            "0.0.0.0       443       0.0.0.0       0          Listen      4",
            "0.0.0.0       80        0.0.0.0       0          Listen      4",
            ""
          ]},
          { flags: ["-LocalPort"], output: [
            "",
            "LocalAddress  LocalPort RemoteAddress RemotePort State       OwningProcess",
            "------------  --------- ------------- ---------- -----       -------------",
            "0.0.0.0       {localport}      0.0.0.0       0          Listen      4",
            ""
          ]}
        ],
        output: [
          "",
          "LocalAddress  LocalPort RemoteAddress RemotePort State       OwningProcess",
          "------------  --------- ------------- ---------- -----       -------------",
          "10.0.0.21     49712     10.0.0.10     389        Established 712",
          "10.0.0.21     3389      10.0.0.5      53122      Established 1188",
          "0.0.0.0       443       0.0.0.0       0          Listen      4",
          ""
        ]
      },

      systeminfo: {
        libraryId: "win-systeminfo",
        summary: { es: "Resumen del sistema: SO, parches, memoria, dominio.", en: "System summary: OS, patches, memory, domain." },
        flags: {},
        stream: { delayMs: 60 },
        output: [
          "",
          "Host Name:                 SRV02",
          "OS Name:                   Microsoft Windows Server 2022 Standard",
          "OS Version:                10.0.20348 N/A Build 20348",
          "OS Manufacturer:           Microsoft Corporation",
          "OS Configuration:          Member Server",
          "Registered Owner:          Departamento IT",
          "Original Install Date:     14/03/2025, 10:12:44",
          "System Boot Time:          27/10/2026, 06:30:02",
          "System Manufacturer:       VMware, Inc.",
          "System Type:               x64-based PC",
          "Total Physical Memory:     16.383 MB",
          "Available Physical Memory: 7.904 MB",
          "Domain:                    corp.local",
          "Logon Server:              \\\\DC01",
          "Hotfix(s):                 3 Hotfix(s) Installed.",
          "                           [01]: KB5044281",
          "                           [02]: KB5041948",
          "                           [03]: KB5045934"
        ]
      },

      "Get-HotFix": {
        libraryId: "win-get-hotfix",
        summary: { es: "Actualizaciones instaladas.", en: "Installed updates." },
        flags: {},
        output: [
          "",
          "Source        Description      HotFixID      InstalledBy          InstalledOn",
          "------        -----------      --------      -----------          -----------",
          "SRV02         Update           KB5041948     NT AUTHORITY\\SYSTEM  12/09/2026 0:00:00",
          "SRV02         Security Update  KB5044281     NT AUTHORITY\\SYSTEM  10/10/2026 0:00:00",
          "SRV02         Security Update  KB5045934     NT AUTHORITY\\SYSTEM  15/10/2026 0:00:00",
          ""
        ]
      },

      "Get-Volume": {
        libraryId: "win-get-volume",
        summary: { es: "Volúmenes con su espacio libre.", en: "Volumes and their free space." },
        flags: {},
        output: [
          "",
          "DriveLetter FriendlyName FileSystemType DriveType HealthStatus OperationalStatus SizeRemaining     Size",
          "----------- ------------ -------------- --------- ------------ ----------------- -------------     ----",
          "C                        NTFS           Fixed     Healthy      OK                     38.12 GB    99.4 GB",
          { text: "D           Datos        NTFS           Fixed     Healthy      OK                     11.03 GB  499.87 GB", style: "warn" },
          ""
        ]
      },

      "Get-LocalGroupMember": {
        libraryId: "win-localgroup",
        summary: { es: "Miembros de un grupo local.", en: "Members of a local group." },
        flags: { "-Group": { es: "Grupo (también sin el parámetro).", en: "Group (also without the parameter)." } },
        requiresArgs: 1,
        sample: "Administrators",
        tryExample: "Get-LocalGroupMember -Group Administrators",
        output: [
          "",
          "ObjectClass Name                    PrincipalSource",
          "----------- ----                    ---------------",
          "User        SRV02\\Administrator     Local",
          "Group       CORP\\Domain Admins      ActiveDirectory",
          "Group       CORP\\GG_Soporte_IT      ActiveDirectory",
          ""
        ]
      },

      net: {
        libraryId: "win-net-user",
        summary: { es: "Usuarios, recursos compartidos y unidades de red (cmd).", en: "Users, shares and network drives (cmd)." },
        flags: { "/domain": { es: "Consulta el dominio en lugar del equipo.", en: "Queries the domain instead of the computer." } },
        subcommands: { user: "user", use: "use", share: "share" },
        sample: "jlopez",
        tryExample: "net user jlopez /domain",
        variants: [
          { sub: "user", flags: [], args: [], output: [
            "",
            "User accounts for \\\\SRV02",
            "",
            "-------------------------------------------------------------------------------",
            "admin                    Administrator            DefaultAccount",
            "Guest                    WDAGUtilityAccount",
            "The command completed successfully.",
            ""
          ]},
          { sub: "user", flags: [], args: ["*"], output: [
            "User name                    {arg0}",
            "Full Name                    ",
            { text: { es: "net user: «{arg0}» es una cuenta del dominio, no de SRV02. Añade /domain: net user {arg0} /domain", en: "net user: \"{arg0}\" is a domain account, not an SRV02 one. Add /domain: net user {arg0} /domain" }, style: "warn" }
          ]},
          { sub: "user", flags: ["/domain"], args: ["*"], output: [
            "The request will be processed at a domain controller for domain corp.local.",
            "",
            "User name                    {arg0}",
            "Full Name                    Juan López",
            "Account active               Yes",
            "Account expires              Never",
            "Password last set            03/11/2026 8:41:10",
            "Password expires             01/02/2027 8:41:10",
            { text: "Last logon                   08/11/2026 8:57:31", style: "ok" },
            "Global Group memberships     *Domain Users  *GG_Ventas",
            "The command completed successfully.",
            ""
          ]},
          { sub: "use", flags: [], args: [], output: [
            "New connections will be remembered.",
            "",
            "Status       Local     Remote                    Network",
            "-------------------------------------------------------------------------------",
            "OK           S:        \\\\srv01\\compartido        Microsoft Windows Network",
            "The command completed successfully."
          ]},
          { sub: "share", flags: [], args: [], output: [
            "",
            "Share name   Resource                        Remark",
            "-------------------------------------------------------------------------------",
            "C$           C:\\                             Default share",
            "IPC$                                         Remote IPC",
            "ADMIN$       C:\\Windows                      Remote Admin",
            "Informes     D:\\Datos\\Informes               Informes de Contabilidad",
            "The command completed successfully."
          ]}
        ],
        usage: [{ es: "Uso: net user [usuario [/domain]] | net use | net share   (prueba: net user jlopez /domain)",
                  en: "Usage: net user [user [/domain]] | net use | net share   (try: net user jlopez /domain)" }]
      },

      "Get-ADUser": {
        libraryId: "win-get-aduser",
        summary: { es: "Consulta usuarios de Active Directory.", en: "Queries Active Directory users." },
        flags: {
          "-Identity": { es: "Usuario (sAMAccountName, DN o SID).", en: "User (sAMAccountName, DN or SID)." },
          "-Properties": { description: { es: "Atributos extra: LastLogonDate, LockedOut…", en: "Extra attributes: LastLogonDate, LockedOut…" }, takesValue: true }
        },
        requiresArgs: 1,
        sample: "jlopez",
        tryExample: "Get-ADUser -Identity jlopez -Properties LastLogonDate",
        usage: [{ es: "Uso: Get-ADUser [-Identity] <usuario> [-Properties atributos]", en: "Usage: Get-ADUser [-Identity] <user> [-Properties attributes]" }],
        variants: [
          { flags: ["-Identity"], output: ["", "DistinguishedName : CN=Juan López,OU=Ventas,OU=Usuarios,DC=corp,DC=local", "Enabled           : True", "Name              : Juan López", "SamAccountName    : {arg0}", "UserPrincipalName : {arg0}@corp.local", ""] },
          { flags: ["-Identity", "-Properties"], output: [
            "",
            "DistinguishedName : CN=Juan López,OU=Ventas,OU=Usuarios,DC=corp,DC=local",
            "Enabled           : True",
            "GivenName         : Juan",
            { text: "LastLogonDate     : 08/11/2026 8:57:31", style: "ok" },
            "LockedOut         : False",
            "Name              : Juan López",
            "SamAccountName    : {arg0}",
            "UserPrincipalName : {arg0}@corp.local",
            ""
          ]},
          { flags: ["-Properties"], output: [
            "",
            "DistinguishedName : CN=Juan López,OU=Ventas,OU=Usuarios,DC=corp,DC=local",
            "Enabled           : True",
            { text: "LastLogonDate     : 08/11/2026 8:57:31", style: "ok" },
            "LockedOut         : False",
            "SamAccountName    : {arg0}",
            ""
          ]}
        ],
        output: [
          "",
          "DistinguishedName : CN=Juan López,OU=Ventas,OU=Usuarios,DC=corp,DC=local",
          "Enabled           : True",
          "GivenName         : Juan",
          "Name              : Juan López",
          "ObjectClass       : user",
          "SamAccountName    : {arg0}",
          "Surname           : López",
          "UserPrincipalName : {arg0}@corp.local",
          ""
        ]
      },

      "Unlock-ADAccount": {
        libraryId: "win-unlock-adaccount",
        summary: { es: "Desbloquea una cuenta de AD (simulado).", en: "Unlocks an AD account (simulated)." },
        flags: { "-Identity": { es: "Usuario.", en: "User." } },
        requiresArgs: 1,
        tryExample: "Unlock-ADAccount -Identity jlopez",
        output: [{ text: { es: "Simulador: en un dominio real la cuenta «{arg0}» quedaría desbloqueada (sin mensaje, como el cmdlet real). Compruébalo con Get-ADUser {arg0} -Properties LockedOut.",
                           en: "Simulator: in a real domain the account \"{arg0}\" would be unlocked (silently, like the real cmdlet). Check it with Get-ADUser {arg0} -Properties LockedOut." }, style: "dim" }]
      },

      "Get-WinEvent": {
        libraryId: "win-get-winevent",
        summary: { es: "Eventos de los registros de Windows.", en: "Events from the Windows logs." },
        flags: {
          "-LogName": { description: { es: "Registro: System, Security, Application…", en: "Log: System, Security, Application…" }, takesValue: true },
          "-MaxEvents": { description: { es: "Número máximo de eventos.", en: "Maximum number of events." }, takesValue: true }
        },
        tryExample: "Get-WinEvent -LogName System -MaxEvents 5",
        variants: [
          { flags: ["-LogName", "-MaxEvents"], output: [
            "",
            "   ProviderName: Service Control Manager",
            "",
            "TimeCreated                      Id LevelDisplayName Message",
            "-----------                      -- ---------------- -------",
            "08/11/2026 9:16:02             7036 Information      The World Wide Web Publishing Service service entered the running state.",
            { text: "08/11/2026 9:15:58             7031 Error            The World Wide Web Publishing Service service terminated unexpectedly.", style: "error" },
            "08/11/2026 7:00:11             7040 Information      The start type of the Windows Update service was changed.",
            "",
            "   ProviderName: Microsoft-Windows-Kernel-General",
            "",
            "TimeCreated                      Id LevelDisplayName Message",
            "-----------                      -- ---------------- -------",
            "08/11/2026 6:00:00               16 Information      The access history in hive \\??\\C:\\Windows\\...",
            ""
          ]}
        ],
        usage: [{ es: "Uso: Get-WinEvent -LogName <registro> [-MaxEvents N]   (prueba: Get-WinEvent -LogName System -MaxEvents 5)",
                  en: "Usage: Get-WinEvent -LogName <log> [-MaxEvents N]   (try: Get-WinEvent -LogName System -MaxEvents 5)" }]
      },

      "Get-FileHash": {
        libraryId: "win-get-filehash",
        summary: { es: "Calcula el hash de un archivo (SHA256 por defecto).", en: "Computes a file's hash (SHA256 by default)." },
        flags: { "-Algorithm": { description: { es: "SHA256, SHA1, MD5…", en: "SHA256, SHA1, MD5…" }, takesValue: true } },
        requiresArgs: 1,
        sample: "notas.txt",
        tryExample: "Get-FileHash .\\notas.txt",
        output: [
          "",
          "Algorithm       Hash                                                                   Path",
          "---------       ----                                                                   ----",
          "SHA256          9F2C4D1E0B8A7735C6E2F14D5A9B03C7E81F6D2A4B5C9E07D3F1A2B6C8E4D0F1       {arg0}",
          ""
        ]
      },

      "Get-ExecutionPolicy": {
        libraryId: "win-set-executionpolicy",
        summary: { es: "Política de ejecución de scripts.", en: "Script execution policy." },
        flags: { "-List": { es: "Por ámbitos.", en: "Per scope." } },
        variants: [{ flags: ["-List"], output: [
          "",
          "        Scope ExecutionPolicy",
          "        ----- ---------------",
          "MachinePolicy       Undefined",
          "   UserPolicy       Undefined",
          "      Process       Undefined",
          "  CurrentUser       Undefined",
          " LocalMachine    RemoteSigned",
          ""
        ]}],
        output: ["RemoteSigned"]
      },

      gpupdate: {
        libraryId: "win-gpupdate",
        summary: { es: "Aplica de nuevo las directivas de grupo.", en: "Reapplies Group Policy." },
        flags: { "/force": { es: "Vuelve a aplicar todas, no solo las cambiadas.", en: "Reapplies all of them, not just the changed ones." } },
        tryExample: "gpupdate /force",
        stream: { delayMs: 500 },
        output: [
          "Updating policy...",
          "",
          { text: "Computer Policy update has completed successfully.", style: "ok" },
          { text: "User Policy update has completed successfully.", style: "ok" }
        ]
      },

      klist: {
        libraryId: "win-klist",
        summary: { es: "Tickets de Kerberos de la sesión.", en: "Kerberos tickets for the session." },
        flags: {},
        subcommands: { purge: "purge" },
        variants: [{ sub: "purge", flags: [], output: ["", "Current LogonId is 0:0x3e7a1", "\tDeleting all tickets:", { text: "\tTicket(s) purged!", style: "ok" }] }],
        output: [
          "",
          "Current LogonId is 0:0x3e7a1",
          "",
          "Cached Tickets: (2)",
          "",
          "#0>\tClient: admin @ CORP.LOCAL",
          "\tServer: krbtgt/CORP.LOCAL @ CORP.LOCAL",
          "\tKerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96",
          "\tEnd Time:   11/8/2026 19:02:11",
          "",
          "#1>\tClient: admin @ CORP.LOCAL",
          "\tServer: cifs/srv01.corp.local @ CORP.LOCAL",
          "\tKerbTicket Encryption Type: AES-256-CTS-HMAC-SHA1-96",
          "\tEnd Time:   11/8/2026 19:02:11"
        ]
      },

      quser: {
        libraryId: "win-quser",
        summary: { es: "Sesiones iniciadas en el equipo.", en: "Sessions signed in on the computer." },
        flags: {},
        output: [
          " USERNAME              SESSIONNAME        ID  STATE   IDLE TIME  LOGON TIME",
          ">admin                 rdp-tcp#3           2  Active          .  08/11/2026 8:59",
          " aruiz                                     3  Disc         1:12  07/11/2026 17:40"
        ]
      },

      "Get-MpComputerStatus": {
        libraryId: "win-defender",
        summary: { es: "Estado de Microsoft Defender.", en: "Microsoft Defender status." },
        flags: {},
        output: [
          "",
          { text: "AMServiceEnabled                : True", style: "ok" },
          { text: "AntivirusEnabled                : True", style: "ok" },
          "AntivirusSignatureLastUpdated   : 08/11/2026 5:12:40",
          { text: "RealTimeProtectionEnabled       : True", style: "ok" },
          "QuickScanEndTime                : 08/11/2026 2:14:09",
          ""
        ]
      },

      sfc: {
        libraryId: "win-sfc-dism",
        summary: { es: "Comprueba y repara archivos del sistema.", en: "Checks and repairs system files." },
        flags: { "/scannow": { es: "Analiza y repara.", en: "Scans and repairs." }, "/verifyonly": { es: "Solo analiza.", en: "Scans only." } },
        tryExample: "sfc /scannow",
        stream: { delayMs: 450 },
        variants: [
          { flags: ["/scannow"], output: [
            "",
            "Beginning system scan.  This process will take some time.",
            "",
            "Beginning verification phase of system scan.",
            "Verification 34% complete.",
            "Verification 71% complete.",
            "Verification 100% complete.",
            "",
            { text: "Windows Resource Protection did not find any integrity violations.", style: "ok" }
          ]},
          { flags: ["/verifyonly"], output: ["", "Verification 100% complete.", "", { text: "Windows Resource Protection did not find any integrity violations.", style: "ok" }] }
        ],
        usage: ["Usage: sfc /scannow | /verifyonly"]
      },

      winget: {
        libraryId: "win-winget",
        summary: { es: "Gestor de paquetes de Windows.", en: "Windows package manager." },
        flags: {},
        subcommands: { list: "list", upgrade: "upgrade", search: "search" },
        sample: "7zip",
        tryExample: "winget upgrade",
        variants: [
          { sub: "upgrade", flags: [], args: [], output: [
            "Name                     Id                      Version   Available Source",
            "-------------------------------------------------------------------------------",
            "7-Zip 24.07 (x64)        7zip.7zip               24.07     24.08     winget",
            "Notepad++ (64-bit x64)   Notepad++.Notepad++     8.6.9     8.7.1     winget",
            "PowerShell 7.4.5.0-x64   Microsoft.PowerShell    7.4.5.0   7.4.6.0   winget",
            { text: "3 upgrades available.", style: "warn" }
          ]},
          { sub: "list", flags: [], args: [], output: [
            "Name                     Id                      Version",
            "--------------------------------------------------------------",
            "7-Zip 24.07 (x64)        7zip.7zip               24.07",
            "Notepad++ (64-bit x64)   Notepad++.Notepad++     8.6.9",
            "PowerShell 7.4.5.0-x64   Microsoft.PowerShell    7.4.5.0"
          ]},
          { sub: "search", flags: [], args: ["*"], output: [
            "Name     Id          Version  Source",
            "-------------------------------------",
            "{arg0}   {arg0}.{arg0}  1.0.0    winget"
          ]}
        ],
        usage: [{ es: "Uso: winget list | upgrade | search <nombre>", en: "Usage: winget list | upgrade | search <name>" }]
      },

      "Remove-Item": {
        libraryId: "win-remove-item",
        aliases: ["rm", "del", "erase", "rd", "rmdir"],
        summary: { es: "Borra archivos o carpetas (simulado: no borra nada).", en: "Deletes files or folders (simulated: deletes nothing)." },
        flags: { "-Recurse": { es: "Incluye el contenido.", en: "Includes the contents." }, "-Force": { es: "También ocultos y de solo lectura.", en: "Also hidden and read-only items." } },
        danger: true,
        requiresArgs: 1,
        tryExample: "Remove-Item D:\\Datos\\Temp -Recurse -Force",
        output: [
          { text: { es: "⚠ Comando destructivo. En el simulador no se borra nada.", en: "⚠ Destructive command. Nothing is deleted in the simulator." }, style: "error" },
          { text: { es: "En un servidor real, «{cmdline}» eliminaría todo sin pasar por la papelera. Prueba antes con -WhatIf.",
                    en: "On a real server, \"{cmdline}\" would delete everything without using the Recycle Bin. Try it with -WhatIf first." }, style: "dim" }
        ]
      },

      "Restart-Computer": {
        libraryId: "win-restart-computer",
        summary: { es: "Reinicia el equipo (simulado).", en: "Restarts the computer (simulated)." },
        flags: { "-ComputerName": { es: "Equipo remoto.", en: "Remote computer." }, "-Force": { es: "Aunque haya sesiones abiertas.", en: "Even with users signed in." } },
        danger: true,
        tryExample: "Restart-Computer -Force",
        output: [
          { text: { es: "⚠ En el simulador no se reinicia nada.", en: "⚠ Nothing is restarted in the simulator." }, style: "error" },
          { text: { es: "En un servidor real se cortarían las sesiones RDP y los servicios hasta que arranque de nuevo. Avisa antes con «quser».",
                    en: "On a real server the RDP sessions and services would drop until it boots again. Warn people first with \"quser\"." }, style: "dim" }
        ]
      }
    }
  }
};
