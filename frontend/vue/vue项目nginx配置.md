## nginx

```
server {
    listen port;
    server_name your.host.name;
    rewrite_log             on;
    charset                 utf8;
    root /home/path/xxxxx;
    index index.html;

    client_max_body_size    100m;

    access_log  /home/xxxx/access.log ;
    error_log  /home/xxxx/error.log;

    location ~* \.(html)$ {
        root /home/path/xxxxx;
        etag on;
        expires 30d;
        index index.html;
    }

    gzip on;
    # 启用gzip压缩的最小文件，小于设置值的文件将不会压缩
    gzip_min_length 1k;
    # gzip 压缩级别，1-10，数字越大压缩的越好，也越占用CPU时间，后面会有详细说明
    gzip_comp_level 6;
    # 进行压缩的文件类型。javascript有多种形式。其中的值可以在 mime.types 文件中找到。
    gzip_types text/plain application/javascript application/x-javascript text/css application/xml text/javascript application/x-httpd-php image/jpeg image/gif image/png font/ttf font/otf image/svg+xml;
    # 是否在http header中添加Vary: Accept-Encoding，建议开启
    gzip_vary on;
    # 禁用IE 6 gzip
    gzip_disable "MSIE [1-6]\.";

    location ~* \.(css|js|jpg|jpeg|gif|png|ico|cur|gz|svg|svgz|map|mp4|ogg|ogv|webm|htc)$ {
        root /home/path/xxxxx;
        index index.html;
        expires 1M;
        access_log off;
        add_header Cache-Control "public";
    }
}
```
