// application/xml implies that the payload should be expected to be a well-formed XML syntax, and implies absolutely
// nothing about the semantics of the encoded information in this serialization format.

// application/affordance+xml implies that the payload should be expected to be a well-formed XML syntax, and implies
// that the semantics of the elements within the body describe link controls. This allows a client to infer how to
// structure their next, protocol-agnostic, request transaction. However, this does absolutely nothing to explain why
// a client would want to conduct the request transaction. Link relations help convey semantic meaning for link
// control structures.

// application/vnd.{vendor}.{resource}+affordance+xml, or even simply application/vnd.{vendor}+affordance+xml, are
// specific enough to imply everything expressed previously, but also that a particular set of link relations should
// be used by a client, automaton or human, to progress through a hypermedia-driven API.

// The same would hold true for application/json, application/affordance+json, and
// application/vnd.{vendor}+affordance+json.
-----------------------------------------------------------------------------------------------------------------------
// multipart/nav-data implies that the payload will have one or more body parts just because the root media type is
// multipart. The subtype, "nav-data," implies there will be body parts that separate the concerns of conveying
// navigation semantics from application-domain data semantics. If data is not needed in a response from a particular
// resource, it's okay to just return the navigation body part alone. The purpose behind the separation of concerns is
// that this media type will allow you to navigate hypermedia-aware APIs without needing to retrofit hypermedia
// semantics within the same media type used for conveying data. This does not imply that the serialization format for
// the hypermedia controls cannot be an existing, well-defined media type such as XML or JSON.

// Body parts are not directly related, and do not necessarily need to be aggregated in order for the whole body to
// make sense. They have their own individual semantics.

// There are very many perks to handling navigation semantics in this manner including, but not limited to:
// - The parsing client of the navigation media type can focus solely on aggregating any link control structures and
//   the link structures embedded information. No distinction has to be made between a link structure and a data
//   structure. The entire media type's only purpose is to convey link structures.
// - A variety of hypermedia-aware media types could be applicable to guiding the API. This could include media types
//   such as Collection+JSON, HAL+JSON, Siren+JSON, HTML, and various XML-based media types.
// - The media type can focus on defining great link semantics. By that, I mean what each link will convey. My own
//   media type "Affordance" defines a link control structure with six factors in mind:
//   1 - ID
//   2 - Protocol-agnostic Method (verb)
//   3 - URI (noun)
//   4 - IANA Link Relations (context)
//   5 - Protocol-agnostic Headers (metadata)
//   6 - Input (payload; very many other hypermedia-aware media types don't have any way to input data)
// - I almost forgot a big one. The data can be ANYTHING!!!! If you embedded navigation semantics within an existing
//   media type that was never intended for navigation, you'd be limited to using that media type for your entire
//   payload. What I'm trying to say is, by removing navigation semantics from the data payload you can have any media
//   type you want in your data payload, application, audio, video, text, multipart, message, etc. Good luck
//   accomplishing that with even the most robust hypermedia-aware media types such as HTML. You'd be directly reliant
//   on the media type to understand properties of transclusion along with whatever media types it chooses to support
//   when embedding.
// - Directly related to the previous comment: Because you can have any accompanying media type, you can have as many
//   different media types your heart desires come from one API. One resource could feed text, one resource could feed
//   video, etc.
// - Directly related to the previous comment: Because you can have any media type come from any resource, you are not
//   limited to only being able to anchor between resources that feed the same media type like an HTML anchor tag.
-----------------------------------------------------------------------------------------------------------------------
// application/xml implies that the payload should be expected to be a well-formed XML syntax, and implies absolutely
// nothing about the semantics of the encoded information in this serialization format.

// application/vnd.crave+xml implies the same thing described above, but also implies that the payload has more
// semantic meaning than just the serialization format that was used to encode it. An ordinary XML validating parser
// could be used to retrieve the data, but a more robust parser would be needed to understand the data in the
// application domain-specific context it was intended to be used in. For example, application/vnd.crave+xml could be
// parsed with an XML parser, and may very well pass checks for being "well-formed" and well-defined by a schema, but
// my parser may be too dumb to understand the semantics of the the contained elements and their respective attributes.
// However, application/vnd.crave+xml would define specific complex elements that could be interpreted by smarter
// consuming clients.

// application/vnd.crave+xml is a very broad application domain. It could potentially encompass every resource that
// my API would have defined. More specific media types may be suitable depending on the size of the API that is being
// defined. How much more specific depends on taste. There could be a media type for each resource, or each "problem
// domain," or each well-defined category of some type.

// application/vnd.crave.merchants+xml is a more specific application domain. It signifies that the contained
// resource representation has semantics regarding merchants for Crave. This could be that the root element in the XML
// will always be a single name, or could be any from a set of names. Again, this depends on taste.

// The same would hold true for application/json, application/vnd.{vendor}+json, and
// application/vnd.{vendor}.{resource}+json.
-----------------------------------------------------------------------------------------------------------------------
GET / HTTP/1.1
Host: localhost:3000
Accept: multipart/nav-data
Authorization: Basic username:password

HTTP/1.1 200 OK
Content-Type: multipart/nav-data; boundary=---------------------------114772229410704779042051621609
Content-Length: {length}

-----------------------------114772229410704779042051621609
Content-Length: {length}
Content-Type: application/vnd.crave+affordance+xml

<affordances id="entry">
  <link id="entry" method="OPTIONS" uri="/" relation="self"/>
  <link id="badges" method="OPTIONS" uri="/badges" relation="introspect"/>
  <link id="campaigns" method="OPTIONS" uri="/campaigns" relation="introspect"/>
  <link id="categories" method="OPTIONS" uri="/categories" relation="introspect"/>
  <link id="craves" method="OPTIONS" uri="/craves" relation="introspect"/>
  <link id="events" method="OPTIONS" uri="/events" relation="introspect"/>
  <link id="leaders" method="OPTIONS" uri="/leaders" relation="introspect"/>
  <link id="merchants" method="OPTIONS" uri="/merchants" relation="introspect"/>
  <link id="questions" method="OPTIONS" uri="/questions" relation="introspect"/>
  <link id="raves" method="OPTIONS" uri="/raves" relation="introspect"/>
  <link id="saves" method="OPTIONS" uri="/saves" relation="introspect"/>
  <link id="users" method="OPTIONS" uri="/users" relation="introspect"/>
  <link id="venues" method="OPTIONS" uri="/venues" relation="introspect"/>
</affordances>
-----------------------------114772229410704779042051621609--
-----------------------------------------------------------------------------------------------------------------------
OPTIONS /badges HTTP/1.1
Host: localhost:3000
Accept: multipart/nav-data
Authorization: Basic username:password

HTTP/1.1 200 OK
Content-Type: multipart/nav-data; boundary=---------------------------114772229410704779042051621609
Content-Length: {length}

-----------------------------114772229410704779042051621609
Content-Length: {length}
Content-Type: application/vnd.crave+affordance+xml

<affordances id="badges">
  <link id="entry" method="OPTIONS" uri="/" relation="introspect"/>
  <link id="badges" method="OPTIONS" uri="/badges" relation="self"/>
  <link id="badges" method="POST" uri="/badges" relation="create">
    <meta id="Accept" value="multipart/nav-data"/>
    <meta id="Authorization" value="Basic username:password"/>
    <meta id="Content-Type" value="application/x-www-form-urlencoded"/>
    <input id="name"
           value=""
           accept="application/x-www-form-urlencoded"
           required="true"
           label="Badge Name"
           hidden="false"
           readonly="false"
           options=""
           regexp=""/>
  </link>
  <link id="badges" method="GET" uri="/badges" relation="read"/>
</affordances>
-----------------------------114772229410704779042051621609--
-----------------------------------------------------------------------------------------------------------------------
POST /badges HTTP/1.1
Host: localhost:3000
Accept: multipart/nav-data
Authorization: Basic username:password
Content-Length: {length}
Content-Type: application/x-www-form-urlencoded

name={value}

HTTP/1.1 201 Created
Content-Type: multipart/nav-data; boundary=---------------------------114772229410704779042051621609
Content-Length: {length}
Location: /badges/1

-----------------------------114772229410704779042051621609
Content-Length: {length}
Content-Type: application/vnd.crave+affordance+xml

<affordances id="badges">
  <link id="entry" method="OPTIONS" uri="/" relation="introspect"/>
  <link id="badges" method="OPTIONS" uri="/badges" relation="introspect"/>
  <link id="new" method="OPTIONS" uri="/badges/1" relation="introspect"/>
  <link id="badges" method="POST" uri="/badges" relation="self">
    <meta id="Accept" value="multipart/nav-data"/>
    <meta id="Authorization" value="Basic username:password"/>
    <meta id="Content-Type" value="application/x-www-form-urlencoded"/>
    <input id="name"
           value=""
           accept="application/x-www-form-urlencoded"
           required="true"
           label="Badge Name"
           hidden="false"
           readonly="false"
           options=""
           regexp=""/>
  </link>
  <link id="badges" method="GET" uri="/badges" relation="read"/>
</affordances>
-----------------------------114772229410704779042051621609--
-----------------------------------------------------------------------------------------------------------------------
