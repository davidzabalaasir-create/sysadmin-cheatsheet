# Auditoría SysAdmin · Ubuntu + Apache + MariaDB

**Alcance:** revisión de la documentación de comandos de la web *Sysadmin* (153 comandos en el momento de la auditoría) frente a un servidor **Ubuntu LTS + Apache 2.4 + MariaDB**, y ampliación con comandos específicos para ese stack.

> **Limitación importante:** no se han aportado logs, salidas de terminal ni configuración real del servidor. Este análisis no diagnostica *tu* servidor: identifica riesgos habituales en este stack y lagunas en la documentación, y para cada uno indica el comando que lo verifica. Pega la salida de esos comandos para un diagnóstico concreto.

Todos los comandos nuevos están en la web, con botón de copiar, nivel de riesgo y requisitos:
https://davidzabalaasir-create.github.io/sysadmin-cheatsheet/

---

## 1. Análisis crítico

### 1.1 Lagunas en la documentación

| Hallazgo | Impacto | Solución en la web |
|---|---|---|
| **No había ni un solo comando de Apache ni de MariaDB.** Los ejemplos de servidor web y base de datos estaban escritos para Nginx y PostgreSQL. | Ante una incidencia no hay procedimiento para tu stack real. | 31 comandos nuevos con prefijo `web-` |
| No hay **procedimiento de backup de la base de datos**. `rsync` copia archivos, pero copiar `/var/lib/mysql` en caliente produce copias **inconsistentes**. | Riesgo de pérdida de datos. | `#web-mariadb-backup`, `#web-cron-flock` |
| No hay análisis de **logs HTTP** para seguridad (solo SSH). | Escaneos, fuerza bruta en logins web e inyecciones pasan desapercibidos. | `#web-log-scans`, `#web-log-bruteforce`, `#web-log-404`, `#web-log-useragents`, `#web-fail2ban-apache` |
| Fail2ban documentado solo para `sshd`. | Apache queda sin protección automática. | `#web-fail2ban-apache` |
| No se comprueba la **renovación de certificados**. | La web deja de funcionar por HTTPS caducado. | `#web-certbot` |
| Sin forma de saber **qué servicios reiniciar tras parchear**. | Apache/MariaDB siguen ejecutando librerías vulnerables en memoria. | `#web-needrestart` |

### 1.2 Riesgos de configuración típicos del stack (a verificar)

| Riesgo | Cómo verificarlo | Qué indica un problema |
|---|---|---|
| **Apache con `mpm_prefork` + `mod_php`** (lo que instala `libapache2-mod-php`). Cada proceso carga PHP entero y consume mucha RAM. | `apache2ctl -V \| grep -i mpm` | `Server MPM: prefork`. Lo recomendable es `mpm_event` + PHP-FPM (`proxy_fcgi`). |
| **`MaxRequestWorkers` mal dimensionado** | `#web-apache-rss` y `#web-apache-errors` | Avisos `AH00484` (se queda corto) o uso de swap (se pasa). |
| **MariaDB escuchando en todas las interfaces** o usuarios con `host = '%'` | `#web-mariadb-security` | `0.0.0.0:3306` o usuarios remotos sin necesidad. |
| **`innodb_buffer_pool_size` por defecto** (128 MB) en un servidor con más RAM | `#web-mysqltuner` | Recomendación de subir el buffer pool. |
| **Logs de Apache sin rotar o con mucha retención** | `du -sh /var/log/apache2` y `#web-logrotate` | Varios GB de logs. |
| **IP real oculta tras un proxy/CDN** (Cloudflare, balanceador) | `awk '{print $1}' access.log \| sort -u \| head` | Solo aparecen IPs del proxy: configura `mod_remoteip`, o los análisis por IP y Fail2ban no sirven. |

---

## 2. Auditoría de los comandos existentes

| Comando en la web | Observación | Alternativa mejor / más moderna |
|---|---|---|
| `cp -a /etc/nginx/nginx.conf …`, `tail -F /var/log/nginx/error.log`, `nginx -t && systemctl reload nginx`, `awk … /var/log/nginx/access.log` | Rutas y comandos de Nginx. | En Apache: `/etc/apache2/`, `/var/log/apache2/`, `apache2ctl configtest && systemctl reload apache2` (`#web-apache-reload`). |
| `apt-mark hold postgresql-16` | Paquete equivocado para tu stack. | `apt-mark hold mariadb-server` y actualiza MariaDB en una ventana aparte, tras hacer backup. |
| `iptables -I INPUT …` | En Ubuntu, las reglas de iptables no persisten sin `iptables-persistent` y **chocan con ufw**. El backend real es nftables. | `ufw` (ya está en la web): `ufw allow 'Apache Full'`, `ufw limit OpenSSH`. Para inspeccionar: `nft list ruleset`. |
| `ss -tunlp \| grep -E ':(80\|443\|3306)\b'` | Funciona, pero filtra con grep. | Filtro nativo de ss: `ss -tlnp '( sport = :80 or sport = :443 or sport = :3306 )'` |
| `top -b -n 1 -o %CPU` | Solo muestra un instante. | `pidstat -u -r -d -C 'apache2\|mariadbd' 5 12` (`#web-pidstat`) mide durante un intervalo y por servicio. |
| `journalctl -u ssh … \| grep 'Failed password' \| awk '{print $(NF-3)}'` | Correcto, pero pasa todo el journal por grep. | `journalctl -u ssh --since today -g 'Failed password'` filtra dentro de journalctl. Fail2ban lo automatiza. |
| `awk '{print $1}' access.log` (top IPs) | Detrás de un CDN o proxy, `$1` es la IP del proxy. | Configura `mod_remoteip` antes de analizar por IP. |
| `smartctl -H -A /dev/sda` | En un VPS o en la nube los discos virtuales **no exponen S.M.A.R.T.** | En VPS usa `iostat -xz` (`#web-iostat`) para medir la latencia del disco. |
| `crontab: 30 2 * * * backup.sh` | No evita que dos ejecuciones se solapen. | `flock -n` (`#web-cron-flock`). |
| `rsync -avzP --delete /srv/www/ …` | Sirve para archivos, no para la base de datos en caliente. | Primero `mariadb-dump` (`#web-mariadb-backup`) y después rsync del volcado. |
| `pkill -TERM -f 'python3 worker.py'` | Un patrón con `-f` puede coincidir con más procesos de los esperados. | Revisa antes con `pgrep -af 'patrón'`. |
| `fail2ban-client status sshd` | Correcto, pero incompleto para un servidor web. | Activa también las jails `apache-*` (`#web-fail2ban-apache`). |

---

## 3. Comandos nuevos (31)

Formato de log asumido: **combined** de Apache en Ubuntu (`$1` IP · `$4` fecha · `$6` método · `$7` ruta · `$9` código HTTP). Si usas `other_vhosts_access.log` (formato `vhost_combined`), el primer campo es el vhost y todas las columnas se desplazan una posición.

<!-- La sección siguiente se genera desde assets/data.js -->

### 3.1 Monitoreo de red e interconexión

#### apachetop  `#web-apachetop`

«top» para Apache: muestra en tiempo real las URLs, IPs y códigos HTTP más solicitados leyendo el access.log.

```bash
sudo apachetop -f /var/log/apache2/access.log -f /var/log/apache2/other_vhosts_access.log -T 60
```

- **Qué hace:** Durante un pico de tráfico, ves al instante qué URL o qué IP está generando la carga en el último minuto.
- **Requisitos:** sudo apt install apachetop
- **Riesgo:** 🟢 Seguro

#### mod_status (server-status)  `#web-server-status`

Marcador interno de Apache: workers ocupados/libres, peticiones por segundo y qué está atendiendo cada proceso en este momento.

```bash
watch -n 2 "curl -s 'http://localhost/server-status?auto' | grep -E 'BusyWorkers|IdleWorkers|ReqPerSec|Scoreboard'"
```

- **Qué hace:** Monitoriza en directo la ocupación de Apache: si los workers libres caen a cero, las peticiones empiezan a hacer cola.
- **Requisitos:** mod_status (activo por defecto en Ubuntu, limitado a localhost). Para fullstatus: sudo apt install lynx
- **Riesgo:** 🟢 Seguro

#### ss (conexiones HTTP por IP)  `#web-ss-per-ip`

Cuenta las conexiones establecidas a los puertos 80/443 agrupadas por IP remota: detecta flood o clientes abusivos.

```bash
ss -Htn state established '( sport = :80 or sport = :443 )' | awk '{print $4}' | sed -E 's/:[0-9]+$//' | sort | uniq -c | sort -nr | head -n 15
```

- **Qué hace:** Las 15 IPs con más conexiones abiertas contra Apache. Una sola IP con cientos de conexiones suele ser un bot o un ataque.
- **Requisitos:** Nativo (iproute2).
- **Riesgo:** 🟢 Seguro

#### ngrep (HTTP en vivo)  `#web-ngrep`

Captura y muestra las peticiones HTTP en claro que llegan al servidor, como un grep sobre el tráfico de red.

```bash
sudo ngrep -q -W byline -d any '^(GET|POST) ' 'tcp dst port 80'
```

- **Qué hace:** Ver en directo qué peticiones llegan por HTTP (por ejemplo, para confirmar si un bot sigue entrando por el puerto 80 o por qué no redirige a HTTPS).
- **Requisitos:** sudo apt install ngrep · Solo ve HTTP sin cifrar (puerto 80 o tráfico interno entre proxy y Apache).
- **Riesgo:** 🟢 Seguro

#### curl -w (desglose de latencia)  `#web-curl-timing`

Desglosa el tiempo de una petición en DNS, TCP, TLS, primer byte (TTFB) y total para saber dónde se pierde el tiempo.

```bash
curl -o /dev/null -s -w 'dns:%{time_namelookup}s tcp:%{time_connect}s tls:%{time_appconnect}s ttfb:%{time_starttransfer}s total:%{time_total}s http:%{http_code}\n' https://tu-dominio.com/
```

- **Qué hace:** Si el TTFB es alto pero DNS/TCP/TLS son rápidos, el cuello de botella está en la aplicación o en la base de datos, no en la red.
- **Requisitos:** Nativo (curl).
- **Riesgo:** 🟢 Seguro

#### logtop  `#web-logtop`

Ranking en tiempo real de cualquier campo de un log (IP, URL, user-agent) con frecuencia por segundo.

```bash
tail -F /var/log/apache2/access.log | awk '{print $1, $7; fflush()}' | logtop
```

- **Qué hace:** Ve en directo qué combinación IP + URL martillea el servidor: típico de un bot atacando wp-login.php o un buscador.
- **Requisitos:** sudo apt install logtop
- **Riesgo:** 🟢 Seguro

#### goaccess  `#web-goaccess`

Analizador de logs web: visitantes, URLs, códigos de error, bots, ancho de banda… en terminal o como informe HTML.

```bash
zcat -f /var/log/apache2/access.log* | goaccess - --log-format=COMBINED -o /root/informe-web-$(date +%F).html
```

- **Qué hace:** Informe de las últimas semanas (logs rotados incluidos). Se guarda fuera de /var/www para no exponerlo públicamente.
- **Requisitos:** sudo apt install goaccess
- **Riesgo:** 🟢 Seguro

### 3.2 Rendimiento y diagnóstico de procesos

#### apache2ctl -V / -M / -S  `#web-apache2ctl`

Radiografía de Apache: MPM en uso (prefork/event), módulos cargados y virtual hosts con el archivo que los define.

```bash
apache2ctl -V | grep -i mpm && apache2ctl -M 2>/dev/null | grep -E 'mpm|php|proxy_fcgi|http2|ssl' && apache2ctl -S
```

- **Qué hace:** Si ves mpm_prefork + php_module, Apache usa mod_php: migrar a mpm_event + PHP-FPM reduce mucho el consumo de RAM.
- **Requisitos:** Nativo (apache2).
- **Riesgo:** 🟢 Seguro

#### ps (RAM por proceso de Apache)  `#web-apache-rss`

Calcula cuánta memoria usa de media cada proceso de Apache para dimensionar MaxRequestWorkers sin agotar la RAM.

```bash
ps -C apache2 -o rss= | awk '{s+=$1; n++} END {printf "procesos=%d  media=%.1f MB  total=%.1f MB\n", n, s/n/1024, s/1024}'
```

- **Qué hace:** Con 4 GB libres para Apache y 60 MB de media por proceso, MaxRequestWorkers no debería pasar de ~65. Si se sobredimensiona, el servidor acaba usando swap.
- **Requisitos:** Nativo.
- **Riesgo:** 🟢 Seguro

#### grep (saturación en error.log)  `#web-apache-errors`

Busca en el error.log los avisos de Apache que indican saturación, timeouts o caídas de PHP-FPM.

```bash
zgrep -hE 'AH00161|AH00484|MaxRequestWorkers|AH01071|timed out' /var/log/apache2/error.log* | awk '{print substr($5,1,4), $2, $3}' | sort | uniq -c | tail -n 20
```

- **Qué hace:** Cuenta por día los avisos de saturación: si coinciden con las quejas de lentitud, hay que ajustar workers o PHP-FPM.
- **Requisitos:** Nativo.
- **Riesgo:** 🟢 Seguro

#### mariadb-admin extended-status  `#web-mariadb-status`

Muestra cada N segundos la variación de los contadores clave de MariaDB: conexiones, consultas por segundo y consultas lentas.

```bash
sudo mariadb-admin extended-status -r -i 5 | grep -E 'Threads_(connected|running)|Questions |Slow_queries|Aborted_connects'
```

- **Qué hace:** Durante un pico, ves si MariaDB es el cuello de botella: Threads_running disparado o Slow_queries creciendo.
- **Requisitos:** Nativo (mariadb-client). En Ubuntu, root entra por socket con sudo sin contraseña.
- **Riesgo:** 🟢 Seguro

#### SHOW PROCESSLIST (consultas activas)  `#web-mariadb-processlist`

Lista las consultas en ejecución con su duración para localizar la que bloquea la base de datos. KILL la cancela.

```bash
sudo mariadb -e "SELECT id, user, db, time, state, LEFT(info,120) AS consulta FROM information_schema.processlist WHERE command <> 'Sleep' AND time > 5 ORDER BY time DESC;"
```

- **Qué hace:** La web va lenta: encuentra la consulta que lleva más tiempo ejecutándose y bloqueando tablas. Cancélala con KILL QUERY solo si sabes qué es.
- **Requisitos:** Nativo (mariadb-client).
- **Riesgo:** 🟡 Precaución

#### slow query log + mariadb-dumpslow  `#web-mariadb-slowlog`

Activa en caliente el registro de consultas lentas y resume las que más tiempo consumen en total.

```bash
sudo mariadb -e "SET GLOBAL slow_query_log=1; SET GLOBAL long_query_time=1;" && sleep 3600 && sudo mariadb-dumpslow -s t -t 10 /var/lib/mysql/$(hostname)-slow.log
```

- **Qué hace:** Recoge una hora de tráfico real y muestra las 10 consultas que más tiempo de base de datos consumen: candidatas a índice o caché.
- **Requisitos:** Nativo (mariadb-server; mariadb-dumpslow equivale a mysqldumpslow). Para que sobreviva al reinicio, añádelo en /etc/mysql/mariadb.conf.d/50-server.cnf.
- **Riesgo:** 🟡 Precaución

#### mysqltuner  `#web-mysqltuner`

Analiza la configuración y estadísticas de MariaDB y recomienda ajustes (buffer pool, conexiones, caché de tablas…).

```bash
sudo mysqltuner --nocolor | tee /root/mysqltuner-$(date +%F).txt | grep -A40 'Recommendations'
```

- **Qué hace:** Revisión mensual de MariaDB: guarda el informe y muestra las recomendaciones (normalmente innodb_buffer_pool_size).
- **Requisitos:** sudo apt install mysqltuner · Ejecutar con al menos 24 h de actividad para que las recomendaciones sean fiables.
- **Riesgo:** 🟢 Seguro

#### pidstat (Apache + MariaDB)  `#web-pidstat`

Mide por intervalos el uso de CPU, RAM y disco de los procesos del servidor web y de la base de datos.

```bash
pidstat -u -r -d -C 'apache2|mariadbd|php-fpm' 5 12
```

- **Qué hace:** Un minuto de muestreo bajo carga: identifica si quien consume CPU o disco es Apache, PHP-FPM o MariaDB.
- **Requisitos:** sudo apt install sysstat
- **Riesgo:** 🟢 Seguro

#### iostat -xz  `#web-iostat`

Latencia y saturación de cada disco. Clave para saber si MariaDB va lenta por el almacenamiento.

```bash
iostat -xzm 5 6
```

- **Qué hace:** Si w_await y %util se disparan cuando la web va lenta, el problema es el disco (escrituras de MariaDB o logs), no la CPU.
- **Requisitos:** sudo apt install sysstat
- **Riesgo:** 🟢 Seguro

#### ab (prueba de carga)  `#web-ab`

ApacheBench: lanza N peticiones con C usuarios simultáneos y mide peticiones por segundo y tiempos de respuesta.

```bash
ab -n 2000 -c 50 -k https://staging.tu-dominio.com/ | grep -E 'Requests per second|Time per request|Failed requests|50%|95%|99%'
```

- **Qué hace:** Compara el rendimiento antes y después de un cambio (OPcache, MPM event, caché) con la misma prueba.
- **Requisitos:** Paquete apache2-utils (se instala con apache2). Úsalo solo contra tus propios servidores y fuera de horas punta.
- **Riesgo:** 🟡 Precaución

### 3.3 Seguridad y análisis de logs

#### awk (IPs con más errores 404)  `#web-log-404`

Lista las IPs que más errores 404 generan: casi siempre escáneres buscando archivos vulnerables.

```bash
zcat -f /var/log/apache2/access.log* | awk '$9 == 404 {print $1}' | sort | uniq -c | sort -nr | awk '$1 > 100' | head -n 20
```

- **Qué hace:** IPs con más de 100 errores 404: candidatas a bloqueo en el firewall o en Fail2ban.
- **Requisitos:** Nativo. Log en formato combined.
- **Riesgo:** 🟢 Seguro

#### grep (escaneos de vulnerabilidades)  `#web-log-scans`

Detecta en el access.log intentos típicos de explotación: .env, .git, phpMyAdmin, path traversal, inyección SQL o XSS.

```bash
grep -Ei '\.env|/\.git/|phpmyadmin|wp-config|\.\./|etc/passwd|union.+select|sleep\(|<script|%3Cscript|base64_decode' /var/log/apache2/access.log | awk '{print $1}' | sort | uniq -c | sort -nr | head -n 20
```

- **Qué hace:** Ranking de IPs que han lanzado sondas de ataque. Comprueba también con awk '$9==200' si alguna de esas peticiones tuvo éxito.
- **Requisitos:** Nativo.
- **Riesgo:** 🟢 Seguro

#### awk (fuerza bruta en logins web)  `#web-log-bruteforce`

Cuenta los POST contra formularios de login (wp-login.php, xmlrpc.php, /admin) por IP para detectar fuerza bruta.

```bash
awk '$6 ~ /POST/ && $7 ~ /wp-login\.php|xmlrpc\.php|\/admin|\/login/ {print $1}' /var/log/apache2/access.log | sort | uniq -c | sort -nr | awk '$1 > 20' | head
```

- **Qué hace:** IPs con más de 20 intentos de login hoy. Si es WordPress, xmlrpc.php permite cientos de intentos por petición: desactívalo si no lo usas.
- **Requisitos:** Nativo.
- **Riesgo:** 🟢 Seguro

#### awk (user-agents sospechosos)  `#web-log-useragents`

Agrupa los user-agents y destaca herramientas de ataque conocidas (sqlmap, nikto, nmap, masscan…).

```bash
awk -F'"' '{print $6}' /var/log/apache2/access.log | grep -Ei 'sqlmap|nikto|nmap|masscan|zgrab|nuclei|wpscan|dirbuster|gobuster|python-requests|curl|^-$' | sort | uniq -c | sort -nr
```

- **Qué hace:** Detecta escáneres automáticos que se identifican en el user-agent; combinado con su IP, puedes bloquearlos con Fail2ban.
- **Requisitos:** Nativo.
- **Riesgo:** 🟢 Seguro

#### awk (peticiones por minuto)  `#web-log-rpm`

Agrupa las peticiones por minuto para localizar picos de tráfico anómalos (DDoS, scraping) y cuándo empezaron.

```bash
awk '{print substr($4, 2, 17)}' /var/log/apache2/access.log | sort | uniq -c | sort -nr | head -n 10
```

- **Qué hace:** Muestra los 10 minutos con más peticiones; después filtra ese minuto con grep para ver qué IPs lo causaron.
- **Requisitos:** Nativo.
- **Riesgo:** 🟢 Seguro

#### fail2ban (jails para Apache)  `#web-fail2ban-apache`

Activa las protecciones de Fail2ban para Apache: autenticación fallida, bots maliciosos, escaneo de scripts y desbordamientos.

```bash
sudo tee /etc/fail2ban/jail.d/apache.local >/dev/null <<'EOF'
[apache-auth]
enabled = true
[apache-badbots]
enabled = true
[apache-noscript]
enabled = true
[apache-overflows]
enabled = true
EOF
sudo fail2ban-client reload && sudo fail2ban-client status
```

- **Qué hace:** Protege Apache con los filtros que ya trae Fail2ban. Añade tu IP de administración a ignoreip en jail.local para no bloquearte.
- **Requisitos:** sudo apt install fail2ban · Incluye ya los filtros apache-*; solo hay que activarlos.
- **Riesgo:** 🟡 Precaución

#### Auditoría de seguridad de MariaDB  `#web-mariadb-security`

Comprueba que MariaDB no está expuesta a Internet y que no hay usuarios accesibles desde cualquier host o sin contraseña.

```bash
sudo ss -tlnp 'sport = :3306' && sudo mariadb -e "SELECT user, host, plugin FROM mysql.user WHERE host NOT IN ('localhost','127.0.0.1','::1') OR user = '';"
```

- **Qué hace:** Si 3306 escucha en todas las interfaces o hay usuarios con host '%', la base de datos está expuesta a ataques de fuerza bruta.
- **Requisitos:** Nativo. Si aparece 0.0.0.0:3306, revisa bind-address en /etc/mysql/mariadb.conf.d/50-server.cnf.
- **Riesgo:** 🟢 Seguro

### 3.4 Mantenimiento y automatización

#### mariadb-dump (backup con rotación)  `#web-mariadb-backup`

Copia de seguridad consistente de todas las bases de datos sin bloquear InnoDB, comprimida y con borrado de copias antiguas.

```bash
sudo mariadb-dump --single-transaction --routines --triggers --events --all-databases | gzip > /backups/mariadb-$(date +%F_%H%M).sql.gz && find /backups -name 'mariadb-*.sql.gz' -mtime +7 -delete
```

- **Qué hace:** Backup nocturno listo para cron. Restaurar: gunzip < archivo.sql.gz | sudo mariadb. Prueba la restauración de vez en cuando.
- **Requisitos:** Nativo (mariadb-client). Guarda una copia fuera del servidor (rsync/rclone).
- **Riesgo:** 🟡 Precaución

#### cron + flock (tareas sin solapamiento)  `#web-cron-flock`

Evita que una tarea programada se ejecute dos veces a la vez si la anterior aún no terminó, y registra su salida.

```bash
30 2 * * * flock -n /run/lock/backup-db.lock /usr/local/bin/backup-db.sh >> /var/log/backup-db.log 2>&1
```

- **Qué hace:** Si un backup tarda más de lo normal, el siguiente no se lanza encima saturando disco y MariaDB.
- **Requisitos:** Nativo (util-linux).
- **Riesgo:** 🟡 Precaución

#### configtest + reload (cambios sin corte)  `#web-apache-reload`

Activa módulos o sitios y aplica la configuración de Apache sin cortar las conexiones activas, solo si la sintaxis es válida.

```bash
sudo a2enmod headers expires http2 && sudo apache2ctl configtest && sudo systemctl reload apache2
```

- **Qué hace:** Activa cabeceras de seguridad, caché de estáticos y HTTP/2. Si configtest falla, no se recarga nada y la web sigue funcionando.
- **Requisitos:** Nativo (apache2).
- **Riesgo:** 🟡 Precaución

#### logrotate -d / -f  `#web-logrotate`

Prueba y fuerza la rotación de logs de Apache para evitar que llenen el disco.

```bash
sudo logrotate -d /etc/logrotate.d/apache2 2>&1 | tail -n 20 && sudo logrotate -f /etc/logrotate.d/apache2
```

- **Qué hace:** El access.log ocupa varios GB: verifica la configuración en modo simulación y rota inmediatamente.
- **Requisitos:** Nativo.
- **Riesgo:** 🟡 Precaución

#### certbot renew --dry-run  `#web-certbot`

Comprueba que la renovación automática de los certificados Let's Encrypt funcionará antes de que caduquen.

```bash
sudo certbot certificates && sudo certbot renew --dry-run && systemctl list-timers | grep -i certbot
```

- **Qué hace:** Confirma caducidades, que la renovación funciona y que el temporizador automático está programado.
- **Requisitos:** sudo apt install certbot python3-certbot-apache (o snap install --classic certbot).
- **Riesgo:** 🟢 Seguro

#### Limpieza de espacio (apt, journal, logs)  `#web-cleanup`

Libera espacio de forma segura: caché de paquetes, kernels antiguos, journal de systemd y logs rotados viejos.

```bash
df -h / && sudo apt clean && sudo apt autoremove --purge -y && sudo journalctl --vacuum-time=14d && sudo find /var/log/apache2 -name '*.gz' -mtime +30 -delete && df -h /
```

- **Qué hace:** Mantenimiento mensual del disco con medición antes y después. Revisa la política de retención de logs antes de borrar.
- **Requisitos:** Nativo.
- **Riesgo:** 🟡 Precaución

### 3.5 Actualizaciones

#### needrestart  `#web-needrestart`

Tras actualizar paquetes, indica qué servicios (Apache, MariaDB, PHP-FPM…) siguen usando librerías antiguas y si hace falta reiniciar el kernel.

```bash
sudo apt update && sudo apt upgrade -y && sudo needrestart -r l
```

- **Qué hace:** Después de parchear OpenSSL o glibc, Apache y MariaDB siguen con la versión vulnerable en memoria hasta reiniciarlos: needrestart te dice cuáles.
- **Requisitos:** Viene instalado en Ubuntu Server 22.04+; si no: sudo apt install needrestart
- **Riesgo:** 🟢 Seguro
