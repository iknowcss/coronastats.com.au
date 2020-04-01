content/build:
	npm run build

content/deploy:
	./bin/deploy-content.sh

data-updater/build:
	./bin/maybe-sudo.sh docker-compose run --entrypoint scripts/build.sh data-updater

data-updater/test:
	./bin/maybe-sudo.sh docker-compose run --entrypoint scripts/test.sh data-updater

infra/deploy:
	./bin/maybe-sudo.sh docker-compose run --entrypoint bin/docker_deploy-infra.sh deployer

gbp:
	git commit -a && git push origin master && make content/build && make content/deploy