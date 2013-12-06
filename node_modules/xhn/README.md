# Introduction

This page offers a brief overview of eXtensible Hypermedia Notation (XHN). This module's purpose is to allow for the
encoding and decoding of hypermedia in a media type agnostic fashion with the help of the Open/Closed Principle.

## Affordance(s) and Input

Psychologist James J. Gibson originally introduced the term in his 1977 article "The Theory of Affordances" and explored
it more fully in his book The Ecological Approach to Visual Perception in 1979. He defined affordances as all "action
possibilities" latent in the environment, objectively measurable and independent of the individual's ability to
recognize them, but always in relation to agents and therefore dependent on their capabilities. For instance, a set of
steps which rises four feet high does not afford the act of climbing if the actor is a crawling infant. Gibson's is the
prevalent definition in cognitive psychology.

In the context of this application, an Affordance is an "action possibility" on a Resource-Oriented Architecture web
API. These may be encoded in any hypermedia-aware media type including, but not limited to, HTML, NavAL, Siren, HAL,
etc.

Affordances is a complex data structure that just represents a collection of Affordance instances.

Input is a key/value pair that is analogous to an input element in HTML forms. It has the same purpose. It affords you
the ability to transfer encoded data in the payload of a request. The media type of the encoded payload is extensible.

### Metadata Cascading Principles
#### Merge Both; Prefer Child:

    {
      "_id": "Hapi API",
      "_affordances": [
        {
          "_id": "Twitter API",
          "_affordances": [
            {
              "_id": "twitter-entry",
              "_method": "GET",
              "_uri": "\/"
            },
            {
              "_id": "twitter-put-tweet",
              "_method": "PUT",
              "_uri": "\/tweets\/{tweet}",
              "_metadata": {
                "Content-Type": "application\/vnd.twitter.com.tweet+json"
              },
              "_controls": [
                {
                  "_id": "text",
                  "_value": ""
                }
              ]
            }
          ],
          "_metadata": {
            "Host": "api.twitter.com",
            "Accept": "multipart\/nav-data"
          }
        }
      ],
      "_metadata": {
        "Host": "api.hapi.co",
        "Accept": "multipart\/nav-data"
      }
    }

#### Yields:

    {
      "_id": "twitter-put-tweet",
      "_method": "PUT",
      "_uri": "\/tweets\/{tweet}",
      "_metadata": {
        "Host": "api.twitter.com",
        "Accept": "multipart\/nav-data",
        "Content-Type": "application\/vnd.twitter.com.tweet+json"
      },
      "_controls": [
        {
          "_id": "text",
          "_value": ""
        }
      ]
    }

#### Merge Parent; Prefer Parent:

    {
      "_id": "Hapi API",
      "_affordances": [
        {
          "_id": "entry",
          "_method": "GET",
          "_uri": "\/"
        }
      ],
      "_metadata": {
        "Host": "api.hapi.co",
        "Accept": "multipart\/nav-data"
      }
    }

#### Yields:

    {
      "_id": "entry",
      "_method": "GET",
      "_uri": "\/",
      "_metadata": {
        "Host": "api.hapi.co",
        "Accept": "multipart\/nav-data"
      }
    }

#### Merge Child; Prefer Child:

    {
      "_affordances": [
        {
          "_id": "put-user",
          "_method": "PUT",
          "_uri": "\/users\/{user}",
          "_metadata": {
            "Content-Type": "application\/vnd.hapi.co.user+json"
          },
          "_controls": [
            {
              "_id": "first_name",
              "_value": ""
            },
            {
              "_id": "last_name",
              "_value": ""
            }
          ]
        }
      ]
    }

#### Yields:

    {
      "_id": "put-user",
      "_method": "PUT",
      "_uri": "\/users\/{user}",
      "_metadata": {
        "Content-Type": "application\/vnd.hapi.co.user+json"
      },
      "_controls": [
        {
          "_id": "first_name",
          "_value": ""
        },
        {
          "_id": "last_name",
          "_value": ""
        }
      ]
    }

## (De) / (En)coder and Plugin

A Decoder allows a user to decode various different media type serializations of Affordance or Affordances instances
with the support of Plugin extensions.

An Encoder allows a user to encode instances of Affordance or Affordances to various different media types with the
support of Plugin extensions.

## HypermediaApi (Hapi)
HypermediaApi allows for the creation of hypermedia-aware responses for an API.

In order for a HypermediaApi to successfully encode a hypermedia-aware response, it must have a full working
knowledge of every possible action within an API. For this to occur, a HypermediaApi must maintain a reference to an
Affordances collection representative of all action possibilities.

In order for a HypermediaApi to successfully encode a hypermedia-aware response, it must utilize an Encoder capable of
encoding Affordances to a hypermedia-aware media type. By default, it uses an Encoder with a NavAL JSON plugin.

HypermediaApi allows for a selection of a subset of action possibilities to be encoded into each response. Most
action possibilities will represent action templates by default due to the usage of URI templates. However, a
HypermediaApi allows for injection of Affordance semantics at run-time to provide dynamic action possibilities.

### A Hypermedia API may optionally have:

- IANA Relations defined in an Affordance-Rich Message
- Transfer Protocol Metadata defined in an Affordance or Affordances Collection
- Input Controls defined in an Affordance
- A Name Identifier

### A Hypermedia API must have:

- Globally-unique Affordance Identifiers
- Greater than or equal to 1 Affordance
- Greater than or equal to 1 Affordance-Rich Message
- A Transfer Protocol
- A Hypermedia-Aware Media Type

### Example:

    hapi('Hapi API')
        .meta({
            'Host': 'api.hapi.co',
            'Accept': 'multipart/nav-data'
        })
        .req('entry', 'GET', '/')
        .req('getUser', 'GET', '/users/{user}')
        .req('deleteUser', 'DELETE', '/users/{user}')
        .req('putUser', 'PUT', '/users/{user}')
        .meta({
            'Content-Type': 'application/vnd.co.hapi.user+json'
        })
        .input({
            _id: 'firstName'
        })
        .input({
            _id: 'lastName'
        })
        .res('entry', '200', ['entry'])
        .res('deleteUser', '200', ['entry', 'putUser', 'getUser'])

## NavAL

NavAL is an instance of Plugin that is capable of encoding to the NavAL JSON media type, and decoding from the NavAL
JSON media type.

## Message(s)

Fielding mentioned hypermedia as the way to modify state on a distributed network. In this he meant “the simultaneous
presentation of information and controls such that the information becomes the affordance through which the user
obtains choices and selects actions.”

“REST is defined by four interface constraints: identification of resources; manipulation of resources through
representations; self-descriptive messages; and, hypermedia as the engine of application state.”

In the context of this application, a Message is a collection of "action possibilities" from a Resource-Oriented
Architecture web API that facilitates the fourth interface constraint of REST. The "action possibilities" are Affordance
identifier Strings.
