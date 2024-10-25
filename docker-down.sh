 docker-compose down
 docker rmi $(docker images -aq)
 docker volume remove zt_mysql-data 
 docker volume remove zt_shared-data 

