
Introduction
============
This is a complete Ansible playbook to setup a cluster of machines,
so that we have one load balancer (frontend), one database server
(backend) and some number of appservers (applayer) in the middle.

This was demonstrated during the NZPUG talk in Auckland, March 19, 2014.

The slides for this talk are in the "Ansible_NZPUG_talk.pdf" file.


What are we doing here?
-----------------------
In this example, we use Ubuntu hosts, nginx as the load balancer,
setup a Django app on each appserver and use postgres on the database
server.

To get Ansible, just do:

    $ pip install ansible

If you have actual servers with IP addresses already, you can use
something like the "hosts" inventory file and "site.yml" playbook.

    $ ansible-playbook -i hosts site.yml

We also have a second option, in which Ansible will create on its
own a number of hosts on Amazon EC2 and fully provision and configure
them in the cluster. This is really useful to easily setup new
test clusters, or to show customers what you're working on, etc.,
or maybe even for the actual deployment cluster.

Ansible isn't limited to EC2, it could also work with Rackspace or
DigitalOcean (it has modules for those).


Dynamically created EC2 host instances
--------------------------------------
If you wish to use dynamically created instanced on Amazon EC2, use
the "ec2_hosts" inventory file and "ec2_site.yml" playbook.

    $ ansible-playbook -i ec2_hosts ec2_site.yml

Please make sure that these environment variables are set:

    AWS_SECRET_ACCESS_KEY=....
    AWS_ACCESS_KEY_ID=...

The values for those variables will be given to you when you create
an Amazon EC2 account.


Modifications for your own projects
-----------------------------------
If you wish to use this for your own projects, you will need to modify
the following settings and files:

    playbooks/roles/appserver/tasks/create_myapp_user.yml

        - In the last step we are doing an SSH keyscan on the bitbucket
          site. If you use github or another repo site, you might want
          to use that instead.

    playbooks/roles/appserver/tasks/install_myapp_system_packages.yml

        - Specify which packages you need to have installed.

    playbooks/roles/appserver/tasks/setup_myapp_django.yml

        - First step: The repo address. This should obviously be the
          address of your own repository.
        - The modification of the settings files.
        - The running of the unit tests.
        - The running of the Django server.

    playbooks/roles/appserver/vars/main.yml

        - All the settings in there, as needed.

    host_vars/localhost

        - All the EC2 related settings. They are in a file called "localhost",
          because the EC2 module is run in the local host.

    group_vars/ap-southeast-2

        - The path to the local copy of your SSH access key for this EC2
          region. You'll have different var-files for different regions.

    playbooks/roles/appserver/files/deployment_keys/

        - In this directory we store the deployment keys that are used by the
          hosts to pull down the source from the repository. You will need to
          place your own file (something like an "id_rsa" file) into that
          directory.


Vagrant
-------
There is also a Vargantfile if you wish to start VMs locally for testing or
development. It uses the vagrant_hosts inventory file. As you can see in that
inventory file, the same host appears in all groups. That's ok, Ansible can
wire it all up anyway, whether the various components run on different hosts
or on the same host.

With that Vagrantfile in place, just do "$ vagrant up" and you'll be in
business.


Closing comments
----------------
It's just been a few weeks that I have worked with Ansible. I'm sure there are
still many things that could be improved in these playbooks. For example:
Currently, all applayer hosts are added to the load-balancing group in nginx.
However, it should really only be those servers that have successfully been
setup. Also, the way I'm patching the Django settings files isn't so nice. It
could be done differently.

Hopefully, this is useful to you anyway.

