## Требования 
* node: ^22.15.30
* docker 
* docker-compose
[https://docs.docker.com/desktop/setup/install/windows-install/]

## Сборка проекта 
```bash
npm i
npm run build
```
##  Запуск БД
```bash
docker-compose up -d
```
##  Запуск проекта
1. Подымаем бд
2. Собираем проект
3. Запускаем проект
```bash
node ./dist/app.js
```

## Пуллер
Для теста накидал скриптик который кидает N запросов раз в секунду. Для запуска достаточно запустить pooller.exe (windows). 
Можно пересобрать  exe со своими параметрами для этого нужен go [https://go.dev/doc/install]

```bash
go build ./pooler.go
```

можно запускать без сборки но go должен быть обязательно установлен
```bash
go run ./pooler.go
```







