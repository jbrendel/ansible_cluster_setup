
Introduction
============
This is a complete Ansible playbook to setup a cluster of machines, so that we
have one load balancer (frontend), one database server (backend) and some number
of appservers (applayer) in the middle. If specified, an APT and PIP cache
server is either used or created as well.

A first version of this was demonstrated during the NZPUG talk in Auckland,
March 19, 2014. The slides for this talk are in the
"docs/Ansible_NZPUG_talk.pdf" file.

In this example, we use Ubuntu hosts, nginx as the load balancer, setup a Django
app on each appserver and use postgres on the database server.


Features
--------
- Deploys complete load-balancer/appserver/DB-server clusters with a single
  command.
- Supported deployment targets: Static servers provided by you, dynamically
  created servers on Amazon EC2 or DigitalOcean, Vagrant virtual machines.
- Support of cluster for deployment or just for running of tests (auto shut-
  down of any created servers at the end of the run).
- Deploys Django applications from your repository.
- Runs unit tests before Django deployment is considered successful.
- Django deployment via auto-re-starting uWSGI for performance and stability.
- Postgres backend database.
- Nginx load balancer with caching configured.
- Utilizes (or creates on demand) APT and PIP caches to speed up cluster
  deployment.
- Configures IPtables to restrict access as much as possible, for example, only
  allow cluster hosts to access database, only allow load balancer to access
  uWSGI port of app server, etc.


Getting Ansible
---------------
To get Ansible (maybe on your laptop), just do:

    $ pip install ansible


Using existing hosts
--------------------
If you have actual servers with IP addresses already, you can use
something like the "hosts" inventory file and "site.yml" playbook.

    $ ansible-playbook -i hosts -e "@vars/extra_vars.yml" site.yml

For information about the "extra_vars.yaml", please see the chapter below about
"Modifications for your own projects". Please note that you will need to create
your own "extra_vars.yml" file (doesn't have to be that name). You can use the
vars/example_extra_vars.yml file as a guide on what to specify there.


Inventory
---------
Have a look at the 'hosts' file. This shows an example 'inventory' file for
our Ansible run. The IP addresses won't work for you, so please replace them
with your own. However, please take note of the groups that are defined here.
Those groups need to be present in your own inventory file.


Using dynamically created hosts
-------------------------------
We also have a second option, in which Ansible will create on its own a number
of hosts on a specified cloud provider and fully provision and configure them in
the cluster. This is really useful to easily setup new test clusters, or to
show customers what you're working on, etc., or maybe even for the actual
deployment cluster.

Currently, we support Amazon EC2 and DitalOcean.

If you wish to use dynamically created instanced on Amazon EC2 or another cloud
provoider, use the "cloud_hosts" inventory file and "cloud_site.yml" playbook.

    $ ansible-playbook -i cloud_hosts  -e "@vars/extra_vars.yml" cloud_site.yml

You can specify the cloud provider you wish to use in the extra_vars.yml file,
by modifying the EXT.ARCHITECTURE.cloud_provider value.

After this playbook has run, a fully populated inventory file can be found in
the location specified by EXT.ARCHITECTURE.cloud_inventory_dump_file (plus a
random number attached to the filename). This inventory file can be used to run
the normal site.yml playbook against an existing, dynamically created cluster,
in case you wish to re-visit a host or modify some settings in the already
running instances.

    $ ansible-playbook -i /var/tmp/cloud_inv-465273546 \
                       -e "@vars/extra_vars.yml" site.yml

For Amazon EC2:
    Please make sure that these environment variables are set:

        AWS_SECRET_ACCESS_KEY=....
        AWS_ACCESS_KEY_ID=...

    The values for those variables will be given to you when you create an
    Amazon EC2 account. Furthermore, you require your region specific SSH key
    for access to the created instances.

For DigitalOcean:
    You will have to have the ID of your SSH key, the ID of the image and the ID
    of the size and region. Most of those things can only be had from their API.
    See their documentation.

    You will also need your client ID and API key. Those can be seen or created
    on their web site.


Testruns in cloud environments
------------------------------
If the only purpose of the cluster is to run tests, it is not necessary to keep
the running instances around after a successful completion. In that case, find
the EXT.PURPOSE parameter and set it to "testrun". In that case, the cluster
is deployed and if all tests run successfully, the cluster nodes will be terminated
right away.


Security
--------
For added security, iptables will be configured as a restrictive firewall, using
the 'ferm' utility. In general, the following ports for incoming connections are
opened:

    Protocol        From             Configured on          Notes
    ---------------------------------------------------------------------------
    SSH             public           all hosts
    ICMP echo       public           all hosts
    80, 443         public           frontend hosts
    3142, 3143      cluster hosts    apt/pip cache host     Cache access ports
    5432            applayer hosts   backend hosts          postgres port
    8091            frontend hosts   applayer hosts         uwsgi port

All other incoming packets/connections will be dropped. Outgoing connections
are not restricted at this point.

If you need to open other ports for other services, please make sure to edit
the ferm.conf.j2 template file accordingly.


Modifications for your own projects
-----------------------------------
If you wish to use this for your own projects, you will need to modify
the following settings and files:

    vars/extra_vars.yml

        - Here you need to define all the customizable settings, such as
          passwords, usernames, paths for key files, desired EC2 regions,
          security groups, as well as the number of hosts that should be
          created. An example template is provided in
          vars/example_extra_vars.yml. This file does not have to be called
          "extra_vars.yml", you just need to specify the right name on the
          ansible-playbook command line.

    playbooks/roles/appserver/tasks/install_myapp_system_packages.yml

        - Specify which packages you need to have installed.

    playbooks/roles/appserver/tasks/setup_myapp_django.yml

        - The modification of the settings files.
        - The running of the unit tests.
        - The running of the Django server.


Repository cache
----------------
When deploying larger clusters, it can be benefitial to utilize a repository
cache, for example an APT cache and/or PIP cache. See the "CACHE" section in the
extra_vars.yml file. If you set "pkg_cache" to "create", one of the cluster
hosts will be designated as the cache server and utilized by all the other hosts
in the cluster. If you already have an existing cache server, you can set
pkg_cache to "use" and specify the IP address of the cache server with the
variable "pkg_cache_existing_ip_addr".


Vagrant
-------
There is also a Vagrantfile if you wish to start VMs locally for testing or
development.  It uses the vagrant_hosts_multi inventory file. In fact, there are
two Vagrantfiles: Vargantfile_Single and Vagrantfile_Multi. The 'Single' option
deploys the entire cluster on a single VM, while the 'Multi' option creates
multiple VMs for a more realistic experience.

With that Vagrantfile in place, just do "$ vagrant up" and you'll be in
business.

If you choose to create a cache host and re-use this cache host for different
"vagrant up" runs, you should use the "provision" command: The Ansible
provisioner runs as part of the cache host bring-up. If it's up already, the
provisioning step wouldn't execute.  Thus, the need to force it with the
"provision" command after the "up" command:

    $ vagrant up
    $ vargant provision


Closing comments
----------------
It's just been a few weeks that I have worked with Ansible. I'm sure there are
still many things that could be improved in these playbooks. For example:
Currently, all applayer hosts are added to the load-balancing group in nginx.
However, it should really only be those servers that have successfully been
setup.

Hopefully, this is useful to you anyway.


Todo
----
- Amazon: Support Amazon RDS.
    - Want to be able to use same instance for multiple DBs.
    - Need to be able to configure new users and DBs for each projetc/run.
    - How to access the server with psql? from localhost? From one of
      the cluster hosts?
- Setup SSL certs and enable SSL on nginx with perfect forward secrecy.
- Make sure only running appservers are added to load balancing group.
- Add support for Rackspace as alternative to EC2 and DigitalOcean.
- Setup database cluster with failover, if possible.
- Add site-testing, either as extra host or as role on the web server
  host: Hitting the finished cluster with Selenium or similar to test
  basic site connectivity.
- Adding monitoring and alerts.
- Amazon: Support Amazon load balancer.
- Amazon: Support adding servers to auto-scale groups.
    - How do we get Ansible to configure the new instances?
        - ansible-pull?
        - Messsage to central server who gets new inventory and
          re-runs playbook?
- Consider use of memcached.
- Consider use of dedicated cache server, such as varnish.



