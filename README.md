
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

    $ ansible-playbook -i hosts -e "@vars/extra_vars.yml" site.yml

For information about the "extra_vars.yaml", please see the chapter
below about "Modifications for your own projects".

We also have a second option, in which Ansible will create on its own a number
of hosts on a specified cloud provider and fully provision and configure them
in the cluster. This is really useful to easily setup new test clusters, or to
show customers what you're working on, etc., or maybe even for the actual
deployment cluster.

Currently, we are supporting only Amazon EC2, but support for other providers
is already planned.


Dynamically created cloud host instances
----------------------------------------
If you wish to use dynamically created instanced on Amazon EC2 or another
cloud provoider, use the "cloud_hosts" inventory file and "cloud_site.yml"
playbook.

    $ ansible-playbook -i cloud_hosts  -e "@vars/extra_vars.yml" cloud_site.yml

Specify the cloud provider you wish to use in EXT.ARCHITECTURE.cloud_provider.
Currently, "ec2" and "digitalocean" are supported.

After this playbook has run, a fully populated inventory file can be found
in the location specified by EXT.ARCHITECTURE.cloud_inventory_dump_file. This
inventory file can be used to run the normal site.yml playbook against an
existing, dynamically created cluster, in case you wish to re-visit a host
or modify some settings in the already running instances.

    $ ansible-playbook -i /var/tmp/cloud_inv-465273546 -e "@vars/extra_vars.yml" site.yml

For Amazon EC2:
    Please make sure that these environment variables are set:

        AWS_SECRET_ACCESS_KEY=....
        AWS_ACCESS_KEY_ID=...

    The values for those variables will be given to you when you create
    an Amazon EC2 account.

For DigitalOcean:
    You will have to have the ID of your SSH key, the ID of the image
    and the ID of the size and region. Most of those things can only be
    had from their API. See their documentation.

    You will also need your client ID and API key. Those can be seen or
    created on their web site.


Modifications for your own projects
-----------------------------------
If you wish to use this for your own projects, you will need to modify
the following settings and files:

    vars/extra_vars.yml

        - Here you need to define all the customizable settings, such
          as passwords, usernames, paths for key files, desired EC2
          regions, security groups, as well as the number of hosts
          that should be created. An example template is provided
          in vars/example_extra_vars.yml.

    playbooks/roles/appserver/tasks/install_myapp_system_packages.yml

        - Specify which packages you need to have installed.

    playbooks/roles/appserver/tasks/setup_myapp_django.yml

        - The modification of the settings files.
        - The running of the unit tests.
        - The running of the Django server.

Vagrant
-------
There is also a Vgrantfile if you wish to start VMs locally for testing or
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


Todo
----
- Better handling of Django settings files (use environment variables,
  rather than patching).
- Make sure only running appservers are added to load balancing group.
- Better, solid deployment of Django as re-starting service.
- Add support for Rackspace as alternative to EC2 and DigitalOcean.
- Setup database cluster with failover, if possible.
- Extend Vagrantfile (or offer second version) that brings up multiple
  Vagrant VMs.
- Add site-testing, either as extra host or as role on the web server
  host: Hitting the finished cluster with Selenium or similar to test
  basic site connectivity.
- Adding monitoring and alerts.
- Amazon: Support Amazon RDS
- Amazon: Support Amazon load balancer.
- Amazon: Support adding servers to auto-scale groups.


