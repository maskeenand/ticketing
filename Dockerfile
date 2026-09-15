FROM composer:2 AS composer

FROM php:8.2-cli

RUN apt-get update \
    && apt-get install -y --no-install-recommends libpq-dev libzip-dev unzip \
    && docker-php-ext-install pdo_pgsql zip \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /var/www/html

COPY --from=composer /usr/bin/composer /usr/bin/composer
COPY . .

RUN composer install --no-dev --no-interaction --prefer-dist --optimize-autoloader

EXPOSE 8085

CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8085"]